#!/usr/bin/env node
// Parse a list of Pascal files and emit per-file JSONL results.
// Usage:  node tools/parse-corpus.js <manifest.txt> <output.jsonl>
// manifest.txt: one absolute path per line.

const fs = require('fs');
const path = require('path');
const Parser = require('tree-sitter');
const Pascal = require(path.join(__dirname, '..', 'bindings', 'node'));

const SNIPPET_LINES_BEFORE = 1;
const SNIPPET_LINES_AFTER = 2;
const MAX_ERROR_SAMPLES_PER_FILE = 5;

if (process.argv.length < 4) {
  console.error('usage: parse-corpus.js <manifest.txt> <output.jsonl>');
  process.exit(2);
}

const manifestPath = process.argv[2];
const outputPath = process.argv[3];

const files = fs.readFileSync(manifestPath, 'utf8')
  .split(/\r?\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0);

const parser = new Parser();
parser.setLanguage(Pascal);

const out = fs.openSync(outputPath, 'w');
let okCount = 0;
let failCount = 0;
let skipCount = 0;
let totalBytes = 0;
let totalParseMs = 0;
const startTotal = Date.now();

function classifyParent(node) {
  // Walk up to find a meaningful parent type for bucketing.
  let p = node.parent;
  while (p && (p.type === 'ERROR' || p.type === 'declarations')) p = p.parent;
  return p ? p.type : '(root)';
}

function recordError(node, sourceLines) {
  const startRow = node.startPosition.row;
  const startCol = node.startPosition.column;
  const endRow = node.endPosition.row;
  const fromLine = Math.max(0, startRow - SNIPPET_LINES_BEFORE);
  const toLine = Math.min(sourceLines.length - 1, startRow + SNIPPET_LINES_AFTER);
  const snippet = sourceLines.slice(fromLine, toLine + 1).join('\n');
  return {
    row: startRow + 1,
    col: startCol + 1,
    endRow: endRow + 1,
    parent: classifyParent(node),
    snippet: snippet.length > 400 ? snippet.slice(0, 400) + '...' : snippet,
  };
}

function findErrors(root, sourceLines, limit) {
  // Walk the tree. For each ERROR node, decide whether it is a "leaf" error:
  // an ERROR whose subtree contains no further ERROR nodes. Those are the
  // actionable points of confusion. Catastrophic outer ERRORs that span the
  // whole file get filtered out unless there is nothing better.
  const allErrors = [];      // every ERROR node
  const leafErrors = [];     // ERROR nodes whose children carry no further error
  let totalErrorNodes = 0;
  let totalMissingNodes = 0;

  function visit(node) {
    if (node.type === 'ERROR') {
      totalErrorNodes++;
      allErrors.push(node);
      let childHasError = false;
      for (let i = 0; i < node.childCount; i++) {
        if (node.child(i).hasError) { childHasError = true; break; }
      }
      if (!childHasError) {
        leafErrors.push(node);
      }
    }
    if (node.isMissing) totalMissingNodes++;
    if (!node.hasError) return; // pruning: skip clean subtrees
    for (let i = 0; i < node.childCount; i++) {
      visit(node.child(i));
    }
  }

  visit(root);

  // Prefer leaf errors. If none found (e.g. the whole file is one giant ERROR
  // with no inner ERROR children, just unmatched tokens), fall back to allErrors.
  const source = leafErrors.length > 0 ? leafErrors : allErrors;
  // Sort by (start row asc, span asc): earliest, smallest first.
  source.sort((a, b) => {
    if (a.startPosition.row !== b.startPosition.row) return a.startPosition.row - b.startPosition.row;
    const sa = a.endPosition.row - a.startPosition.row;
    const sb = b.endPosition.row - b.startPosition.row;
    return sa - sb;
  });
  const samples = source.slice(0, limit).map(n => recordError(n, sourceLines));
  return { samples, errorNodeCount: totalErrorNodes, missingNodeCount: totalMissingNodes };
}

for (const file of files) {
  let bytes = 0;
  let lines = 0;
  let source;
  let raw;
  try {
    raw = fs.readFileSync(file);
    bytes = raw.length;
    // Pascal source is typically ANSI/CP-1252 or UTF-8. Try UTF-8, fall back.
    try {
      source = raw.toString('utf8');
    } catch (e) {
      source = raw.toString('binary');
    }
    lines = (source.match(/\n/g) || []).length + 1;
  } catch (e) {
    skipCount++;
    fs.writeSync(out, JSON.stringify({ file, error: 'read_failed', message: String(e) }) + '\n');
    continue;
  }
  totalBytes += bytes;

  // Skip non-DFM files that happen to carry a .dfm extension. Three classes:
  //
  //   1. Binary DFM (TPF0 record-stream format). The text grammar fundamentally
  //      cannot parse binary form. Detect via the 'TPF0' marker in head bytes
  //      OR a non-whitespace non-printable first byte.
  //   2. Text-template files with substitution placeholders (`%FORMNAME%`,
  //      `%PROJECT%`). Not valid Pascal/DFM until a generator substitutes
  //      them — JCL's package generator does this.
  //   3. XML files mislabeled .dfm — .dproj is the actual extension. The
  //      `.dfm` extension here is an oversight in the source tree.
  //   4. Placeholder files containing only 'TODO' or similar — never written.
  {
    const head = raw.slice(0, 256);
    let skip = null;
    if (head.indexOf(Buffer.from('TPF0')) !== -1) skip = 'binary_dfm';
    else if (bytes > 0 && head[0] < 32 && head[0] !== 9 && head[0] !== 10 && head[0] !== 13)
      skip = 'binary_dfm';
    else {
      const text = source.slice(0, 256);
      if (/<Project\s+xmlns=/.test(text) || /<\?xml/.test(text)) skip = 'xml_not_dfm';
      else if (/%[A-Z][A-Z0-9_]*%/.test(source.slice(0, 200))) skip = 'template_placeholder';
      else if (source.trim() === 'TODO' || source.trim().length < 5) skip = 'empty_or_todo';
      else if (!/[Ee][Nn][Dd]\s*$/.test(source)) skip = 'truncated_no_end';
    }
    if (skip) {
      skipCount++;
      fs.writeSync(out, JSON.stringify({ file, error: skip, bytes }) + '\n');
      continue;
    }
  }

  const t0 = Date.now();
  let tree;
  try {
    tree = parser.parse(source);
  } catch (e) {
    skipCount++;
    fs.writeSync(out, JSON.stringify({ file, error: 'parse_threw', message: String(e) }) + '\n');
    continue;
  }
  const parseMs = Date.now() - t0;
  totalParseMs += parseMs;

  const sourceLines = source.split(/\r?\n/);
  const { samples, errorNodeCount, missingNodeCount } = findErrors(tree.rootNode, sourceLines, MAX_ERROR_SAMPLES_PER_FILE);
  const ok = errorNodeCount === 0 && !tree.rootNode.hasError;
  if (ok) okCount++; else failCount++;

  const rec = {
    file,
    bytes,
    lines,
    parse_ms: parseMs,
    ok,
    error_count: errorNodeCount,
    missing_count: missingNodeCount,
    first_error: samples[0] || null,
    samples: samples.slice(1),  // additional samples after first
  };
  fs.writeSync(out, JSON.stringify(rec) + '\n');

  // Lightweight progress to stderr every 200 files
  if (((okCount + failCount + skipCount) % 200) === 0) {
    process.stderr.write(`  ... ${okCount + failCount + skipCount}/${files.length}  ok=${okCount} fail=${failCount} skip=${skipCount}\n`);
  }
}

fs.closeSync(out);

const totalMs = Date.now() - startTotal;
const summary = {
  total: files.length,
  ok: okCount,
  fail: failCount,
  skip: skipCount,
  total_bytes: totalBytes,
  total_parse_ms: totalParseMs,
  wall_ms: totalMs,
};
process.stderr.write('SUMMARY ' + JSON.stringify(summary) + '\n');
console.log(JSON.stringify(summary));
