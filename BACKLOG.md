# tree-sitter-DFM — BACKLOG

> Replaced by the loop's first DFM iteration with real fingerprints from the corpus.

## Seed candidates (consider only if data doesn't suggest something better)

- TODO  String concatenation across multiple `+` and `#NN` codes with line breaks.
- TODO  Multi-line lists `(...)` for `Items.Strings` (TStrings persisted form).
- TODO  Big binary blobs `Picture.Data = { ... }` with thousands of hex bytes (performance).
- TODO  Special property names that look like keywords (`Items.End`, `Object.Class`, etc.) — should still parse.
- TODO  `inline` and `inherited` headers with explicit position index: `inherited X: T [0]`.
- TODO  Floating-point with exponent (`1.5e-3`).
- TODO  Negative numbers (already covered as token but verify).
- TODO  Hex literal in places where integer is expected (e.g. `Color = $00FF00FF`).
- TODO  Unicode codepoint char codes (`#$00A0`), as opposed to decimal `#160`.
- TODO  Adjacent string atoms without `+` separator.

## Live queue (auto-managed by loop)

| # | status | feature | source-of-truth | last-touched |
|---|--------|---------|-----------------|--------------|
| — | —      | —       | —               | —            |
