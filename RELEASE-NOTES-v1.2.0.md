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
- Corpus A/B (`tree-sitter parse --stat`) over the local .dfm/.fmx manifest:
  see the drag-lint lane report (C:\TEMP\claude\lanes\149\DF\REPORT.md).
