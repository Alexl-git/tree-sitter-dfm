# tree-sitter-dfm

[![npm](https://img.shields.io/npm/v/tree-sitter-dfm.svg)](https://www.npmjs.com/package/tree-sitter-dfm)
[![license](https://img.shields.io/npm/l/tree-sitter-dfm.svg)](LICENSE)

Tree-sitter grammar for Delphi DFM/FMX form files (text format).

**100.00% pass rate** on 11,044 real text-DFM files across a 39K-file Delphi corpus (zero ERROR nodes).

## What is DFM?

DFM (and its FireMonkey sibling FMX) is the text-serialization of VCL/FMX form trees emitted by the Delphi IDE. Every form, frame, and data module in a Delphi project has a `.dfm` / `.fmx` companion alongside the `.pas` source. The grammar handles the standard `object`/`inherited`/`inline` declaration tree with properties, values, nested collections, and hex binary blobs.

## Install

```sh
npm install tree-sitter-dfm tree-sitter
```

## Usage

```js
const fs = require('fs');
const Parser = require('tree-sitter');
const DFM = require('tree-sitter-dfm');

const parser = new Parser();
parser.setLanguage(DFM);

const source = fs.readFileSync('MainForm.dfm', 'utf8');
const tree = parser.parse(source);
console.log(tree.rootNode.toString());
```

## What's covered

- `object` / `inherited` / `inline` headers (with optional class type and position index)
- Nested children of arbitrary depth
- Properties with qualified names (`Font.Style.fsBold`)
- String values with `#NN` character codes and `+` concatenation across lines
- Numeric values (integer, float, hex `$00FF8800`)
- Datetime literals (`Value = 0d`)
- Boolean values
- Set and list collections
- Items collections (`Items = <` … `>`)
- Hex blobs (`Picture.Data = {0AFC...}`)
- Identifier values (enum members, references)
- Unicode letters inside identifiers (Delphi 2009+ names such as `btnUeber` with a real U-umlaut; input must be UTF-8) -- v1.2.0
- Line comments `//`

## What's not covered

- **Binary DFM** (TPF0 record-stream format, ~706 files in the corpus). Different format — separate parser needed.
- **JCL templates** with `%FORMNAME%` placeholders (~2 files). These aren't valid DFM until text-substitution runs.

These are excluded by the harness, not counted as failures.

## Build from source

```sh
git clone https://github.com/Alexl-git/tree-sitter-dfm
cd tree-sitter-dfm
npm install --ignore-scripts
./node_modules/.bin/tree-sitter generate
node-gyp rebuild
```

## Companion

A separate grammar pipeline for Delphi source code (`.pas` / `.dpr` / `.dpk`) lives at [tree-sitter-delphi13](https://github.com/Alexl-git/tree-sitter-delphi13).

```sh
npm install tree-sitter-delphi13
```

## License

MIT.
