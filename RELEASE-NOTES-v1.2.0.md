# tree-sitter-dfm v1.2.0

## Identifier rule accepts Unicode letters (drag-lint wave 149, lane DF)

Delphi identifiers may contain Unicode letters since Delphi 2009, and the IDE
writes them into a text .dfm as they are (ANSI code page, or UTF-8 with a BOM
when the page cannot hold them). The 1.0 / 1.1 `identifier` rule was
`[A-Za-z_][A-Za-z0-9_]*`, so `object btnUeber: TButton` with a real
U-umlaut lexed as `btn` + a stray token: the object header broke, and
drag-lint stored the component under its ASCII prefix (`btn`), which is why
`convert-apply --only btnUeber` could not locate the block.

`identifier` is now `[\p{L}\p{Nl}_][\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}_]*`:
letters, letter-numbers and `_` start it; combining marks and decimal digits
may follow. Keywords (`object` / `inherited` / `inline` / `end` /
`item` / `true` / `false`) are unchanged and stay ASCII. The input must
be UTF-8 (tree-sitter decodes an invalid byte as U+FFFD, which is not a letter):
a Windows-1252 file is transcoded by the host before the parse.

## Compatibility

- No node type added or removed; `node-types.json` is unchanged apart from
  regeneration. Every tree that parsed under 1.1.0 parses identically.
- Generated with tree-sitter CLI 0.24.7 (`src/tree_sitter/*.h` refreshed).

## Verification

- drag-lint fixtures `tests/fixtures/dfm-nonascii` (Windows-1252 and UTF-8+BOM):
  symbol names `btnUeber` / Cyrillic `btnDa` stored whole (were `btn`).
- Corpus tree A/B, 1.1.0 vs 1.2.0 (x64 DLLs built from each tag's `src/parser.c`,
  trees compared node by node) over the local manifest of 2322 .dfm/.fmx files
  (RAD Studio 37.0 sources, DevExpress, DUnit, JEDI/JVCL, production forms):
  2322 parsed, 0 missing; failing 2 -> 2 (the same two DUnit files, pre-existing);
  0 newly failing, 0 tree changes on any file. None of these files has a non-ASCII
  identifier, so 1.2.0 does not change how they parse.
- Positive control: the UTF-8+BOM fixture `FormUtf8.dfm` goes from ERROR to clean
  (two `object` headers repaired). The Windows-1252 twin still fails when given
  raw bytes, as expected: the host must transcode it first (see above).
