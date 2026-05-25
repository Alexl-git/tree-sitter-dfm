# tree-sitter-dfm

Tree-sitter grammar for Delphi DFM (Form file) text format.

DFM is the text-serialization of VCL/FMX form trees emitted by the Delphi IDE.

## Status

Seed grammar — pending iterative refinement against the local Delphi corpus.

## Supported (initial scaffold)

- `object` / `inherited` / `inline` headers (with optional class type and position index)
- Properties with qualified names (`Properties.Buttons`)
- Value kinds:
  - Strings (single-quoted with `''` escape, `#NN` char codes, `+` concatenation)
  - Integers, floats, booleans
  - Identifiers (including qualified, e.g. `Vcl.Forms.fsBold`)
  - Sets `[ a, b, c ]`
  - Lists `( v1 v2 v3 )` (typically TStringList persistence)
  - Items collections `< item ... end item ... end >`
  - Binary blobs `{ DEAD BEEF ... }` (hex)
- Nested objects
- Line comments `//`

## Build

```powershell
npm install --ignore-scripts
.\node_modules\.bin\tree-sitter generate
node "C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\bin\node-gyp.js" rebuild
```

## Test

```powershell
.\node_modules\.bin\tree-sitter parse examples\*
node tools\parse-corpus.js work\manifest-baseline.txt work\results-baseline.jsonl
```
