# tree-sitter-DFM — STATUS

> This project becomes active only after a switch from `tree-sitter-pascal`.
> Read `C:\Projects\tree-sitter-pascal\LOOP-PROMPT.md` for the iteration procedure (it is project-agnostic).

## Active state

**Active — Stage 2** (transitioned from Stage 1 / Pascal on 2026-05-24 ~04:00 after Pascal hit practical ceiling at 89.72%).

## Last measurement (DFM iter 2, 2026-05-24)

| metric | value |
|--------|-------|
| corpus files | 11,759 (.dfm/.fmx under all Pascal corpus roots) |
| **real text-DFM pass rate** | **100.00%** (11,044 OK / 0 FAIL) |
| harness skips | 715 non-DFM files (binary / template / XML / TODO / truncated) |
| wall time | ~16 s |

## Iteration history

| # | timestamp | total | OK | FAIL | skip | notes |
|---|-----------|-------|----|------|------|-------|
| 0 | 2026-05-24 03:30 | 11,759 | 10,955 | 804 | 0 | baseline seed grammar |
| 1 | 2026-05-24 04:00 | 11,759 | 11,044 | 715 |   0 | `datetime_literal` (`Value = 0d`) + `hex_literal` (`Color = $00FF8800`) added |
| 2 | 2026-05-24 05:00 | 11,759 | 11,044 |   **0** | 715 | Harness now skips binary / template / XML / TODO / truncated `.dfm` files |

## Remaining "skip" categories (not grammar failures)

| count  | category                      | notes                                                       |
|--------|-------------------------------|-------------------------------------------------------------|
| ~706   | binary_dfm                    | TPF0 record-stream binary format — separate parser needed   |
| ~4     | truncated_no_end              | Source files cut off mid-property (corrupt saves)           |
| ~2     | template_placeholder          | JCL templates with %FORMNAME% (text-substitution input)     |
| ~2     | empty_or_todo                 | Files with only "TODO" content                              |
| 1      | xml_not_dfm                   | MSBuild .dproj mislabeled with .dfm extension               |

## Status: complete on text-DFM

The DFM workstream has reached **100% on real text-DFM files**. Further work
on this grammar requires either:

1. A **binary-DFM parser** as a sibling project (706 corpus files)
2. **Pre-substitution** of JCL templates before parsing (2 files)

Both are out of scope for this workstream as designed. The grammar can be
upstreamed / published as `tree-sitter-dfm` v1.0.

## Switch from Pascal happens when

- Pascal pass rate ≥ 99%, OR
- 3 consecutive iterations with no measurable progress on Pascal, OR
- Pascal `grammar.js` fails generate 3 times in a row.

## What the first DFM iteration should do

1. Build full DFM manifest: `pwsh -File tools/build-manifest.ps1 -OutFile work/manifest-baseline.txt`
2. Run baseline parse: `node tools/parse-corpus.js work/manifest-baseline.txt work/results-baseline.jsonl`
3. Summarize: `node tools/summarize.js work/results-baseline.jsonl work/SUMMARY-baseline.md`
4. Build BACKLOG from the SUMMARY's top fingerprints.
5. Start iteration 1 per the Pascal LOOP-PROMPT.md (paths swap).
6. Update this STATUS.md and append to LOG.md.

## Initial grammar coverage

The seed `grammar.js` covers:
- `object` / `inherited` / `inline` headers (with optional class and index)
- Properties with qualified names (`Properties.Buttons`)
- Values: strings (with `#NN` char codes and `+` concatenation), integers, floats, booleans, identifiers, sets `[]`, lists `()`, items collections `<item ... end>`, hex blobs `{...}`
- Comments `// ...`

Initial smoke test on synthetic example DFM files (`examples/simple-form.dfm`, `examples/with-collection.dfm`) parsed with **zero errors**.
