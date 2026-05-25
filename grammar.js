/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
//
// Tree-sitter grammar for Delphi DFM (Form file) text format.
//
// DFM is the text-form serialization of Delphi VCL/FMX form trees.
// Reference syntax:
//
//   object IDENT[: TYPE]                         start of a component
//   inherited IDENT[: TYPE] [INDEX]              inherited form's child
//   inline IDENT[: TYPE] [INDEX]                 inline-embedded child
//     property = value                            simple property
//     QualName.SubName = value                    sub-property
//     ...nested objects...
//   end
//
// Values can be: identifiers, integers, floats, single-quoted strings (with
// embedded '' for a literal quote, joined with `+` or `#NN` char codes),
// hex binary blobs `{ DEAD BEEF ... }`, sets `[a, b, c]`, parenthesised lists
// `(value value ...)` (typically TStringList), or items collections
// `<item ... end item ... end>`.

module.exports = grammar({
  name: 'dfm',

  extras: $ => [
    /[ \t\r\n]+/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [],

  rules: {
    source_file: $ => repeat($.object),

    object: $ => seq(
      field('kind', choice(
        alias(/[Oo][Bb][Jj][Ee][Cc][Tt]/, 'object'),
        alias(/[Ii][Nn][Hh][Ee][Rr][Ii][Tt][Ee][Dd]/, 'inherited'),
        alias(/[Ii][Nn][Ll][Ii][Nn][Ee]/, 'inline'),
      )),
      field('name', $.identifier),
      optional(seq(':', field('class', $.identifier))),
      optional(field('index', seq('[', $.integer, ']'))),
      repeat(choice(
        $.property,
        $.object,
      )),
      alias(/[Ee][Nn][Dd]/, 'end'),
    ),

    property: $ => seq(
      field('name', $.qualified_identifier),
      '=',
      field('value', $._value),
    ),

    qualified_identifier: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier)),
    ),

    _value: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.identifier_value,
      $.set,
      $.list,
      $.items,
      $.binary_blob,
    ),

    // ---- atoms ----

    boolean: $ => choice(
      alias(/[Tt][Rr][Uu][Ee]/, 'true'),
      alias(/[Ff][Aa][Ll][Ss][Ee]/, 'false'),
    ),

    // Identifier (also covers qualified ident values like 'Font.Color' values
    // such as clWindowText, alTop, bvNone, etc.). Modeled as qualified ident
    // so we can express enum-style values with namespace prefixes.
    identifier_value: $ => prec(-1, $.qualified_identifier),

    // Numeric: integer, float, datetime, or hex. Tree-sitter doesn't
    // backtrack on tokens, so longer forms come first via prec.
    number: $ => choice(
      $.datetime_literal,
      $.float,
      $.integer,
      $.hex_literal,
    ),
    integer: $ => token(prec(1, /-?\d+/)),
    float:   $ => token(prec(2, /-?\d+\.\d+([eE][-+]?\d+)?/)),
    // DFM TDateTime literal: `0d`, `38187d`, `38187.5d`. The `d` suffix
    // marks the value as a TDateTime (days since 1899-12-30) rather than
    // a plain number, so the IDE preserves type info on round-trips.
    datetime_literal: $ => token(prec(3, /-?\d+(\.\d+)?[dD]/)),
    // Hex literal: $00FF8800 for color values etc. (`Color = $00FF8800`).
    hex_literal: $ => token(prec(3, /\$[0-9A-Fa-f]+/)),

    // String values: a non-empty sequence of quoted-string-atoms or char codes,
    // optionally joined with `+`. Adjacent atoms (across newlines, no `+`) are
    // also legal in DFM, so we allow both.
    string: $ => prec.left(seq(
      $._string_atom,
      repeat(seq(optional('+'), $._string_atom)),
    )),
    _string_atom: $ => choice(
      $.quoted_string,
      $.char_code,
    ),
    quoted_string: $ => token(/'([^'\r\n]|'')*'/),
    char_code: $ => token(/#\d+/),

    // Binary blob: hex digits inside braces, whitespace permitted.
    binary_blob: $ => seq(
      '{',
      optional(token.immediate(/[\s0-9A-Fa-f]+/)),
      '}',
    ),

    // Set literal: `[]` or `[a, b, c]`. Members are identifiers (sometimes
    // qualified, e.g. `[Vcl.Forms.fsBold]`) or integers in rare cases.
    set: $ => seq(
      '[',
      optional(seq(
        $._set_member,
        repeat(seq(',', $._set_member)),
        optional(','),
      )),
      ']',
    ),
    _set_member: $ => choice(
      $.qualified_identifier,
      $.integer,
    ),

    // List literal: parenthesised sequence of values, typically used for
    // TStrings persisted content: ('line 1' 'line 2' 'line 3').
    list: $ => seq(
      '(',
      repeat($._value),
      ')',
    ),

    // Items collection: <item ... end item ... end>, used by TCollections.
    // Each item may contain properties and nested objects.
    items: $ => seq(
      '<',
      repeat($._item),
      '>',
    ),
    _item: $ => seq(
      alias(/[Ii][Tt][Ee][Mm]/, 'item'),
      repeat(choice($.property, $.object)),
      alias(/[Ee][Nn][Dd]/, 'end'),
    ),

    // Identifiers in DFM are case-insensitive ASCII names.
    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    // Comments are not part of the DFM format produced by the IDE, but some
    // hand-edited DFMs include // line comments. Permit them for resilience.
    comment: $ => token(seq('//', /[^\r\n]*/)),
  },
});
