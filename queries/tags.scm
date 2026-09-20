; tags.scm -- tree-sitter-dfm
;
; Symbol extraction in the standard tree-sitter "tags" format, consumed by
; GitHub's tags CLI, nvim-treesitter and the VS Code / Cursor codebase indexers.
;
;   @name               the identifier indexed for the symbol
;   @definition.<kind>  the node the symbol spans
;   @reference.<kind>   a use site
;
; WHY A .dfm IS WORTH INDEXING
; A DFM is the other half of a Delphi form. Every `object Foo: TBar` is a
; published field on the form class declared in the sibling .pas, and every
; `OnClick = ButtonClick` is a call edge into a method of that same class.
; Indexing those two things is what lets "go to definition" cross the
; .pas/.dfm boundary instead of dead-ending at the form declaration.

;; ------------------------------------------------------------- components --

; The root object IS the form / datamodule / frame -- the run-time counterpart
; of the class declared in the sibling unit.
(source_file
  (object name: (identifier) @name) @definition.class)

; Every nested object is a published field on that class.
(object
  (object name: (identifier) @name) @definition.field)

; Components inside a TCollection item.
(items
  (object name: (identifier) @name) @definition.field)

;; ------------------------------------------------------------- references --

; `object Panel1: TPanel` -- TPanel is a type declared in the VCL / FMX / a
; third-party package (DevExpress cx*/dx*, etc).
(object class: (identifier) @name) @reference.class

; Event wiring: `OnClick = Button1Click` names a method on the form class.
; Restricted to On* properties so ordinary enum values (Align = alTop,
; Color = clBtnFace) are not mistaken for call edges.
((property
   name: (qualified_identifier) @_prop
   value: (identifier_value (qualified_identifier (identifier) @name))) @reference.call
 (#match? @_prop "^[Oo][Nn]"))