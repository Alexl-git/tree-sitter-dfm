; folds.scm -- tree-sitter-dfm
;
; Nodes that may be collapsed to a single line. `@fold` is the capture name
; read by nvim-treesitter, Helix and Zed.
;
; Folding matters more in a DFM than in most formats: a real VCL form is a
; deeply nested component tree, and a single `Picture.Data` blob or a
; DevExpress grid's `Columns = <...>` collection routinely runs to hundreds
; of lines of noise between the properties a human is actually reading.

[
  (object)        ; object Panel1: TPanel ... end
  (items)         ; <item ... end item ... end>
  (list)          ; ('line 1' 'line 2' ...)
  (set)           ; [fsBold, fsItalic]
  (binary_blob)   ; { 0A1B2C ... }
  (string)        ; a long #-joined / '+'-continued string
] @fold