# tree-sitter-dfm v1.0.0

First production release of a tree-sitter grammar for Delphi DFM/FMX form files (text format).

## Headline

**100.00% pass rate on 11,044 real text-DFM files** (zero ERROR nodes in the resulting tree).

Corpus: every `.dfm` and `.fmx` file across a 39K-file Delphi corpus (RAD Studio 13 RTL/VCL, DevExpress, JEDI, Spring4D, kbmMW, FireDAC, ORM3, and others). After filtering 715 non-text-DFM files (binary TPF0 format, JCL template placeholders, corrupted-mid-save, XML mislabeled as .dfm), the remaining 11,044 real text-DFM files **all parse cleanly**.

## What's covered

- `object` / `inherited` / `inline` headers, anonymous or named
- Nested children of arbitrary depth
- Properties with qualified names (`Font.Style.fsBold`)
- String values with `#NN` character codes and `+` concatenation across lines
- Numeric values (integer, float, hex `$00FF8800`)
- Datetime literals (`Value = 0d`)
- Boolean values
- Set and list collections
- Items collections (`Items = <` ... `>`)
- Hex blobs (`Picture.Data = {0AFC...}`)
- Identifier values (enum members, references)

## What's not covered

- **Binary DFM** (TPF0 record-stream format, ~706 files in the corpus). This is a completely different format — separate parser needed if you want one.
- **JCL templates** with `%FORMNAME%` placeholders (~2 files). These aren't valid DFM until text-substitution runs.

These are excluded by the harness, not counted as failures.

## Install

```sh
git clone https://github.com/Alexl-git/tree-sitter-dfm
cd tree-sitter-dfm
npm install --ignore-scripts
./node_modules/.bin/tree-sitter generate
node-gyp rebuild
```

npm publishing is planned for a follow-up release.

## Companion

A separate grammar pipeline for Delphi source code (`.pas` / `.dpr` / `.dpk`) lives at [github.com/Alexl-git/tree-sitter-delphi13](https://github.com/Alexl-git/tree-sitter-delphi13).

## License

MIT.
