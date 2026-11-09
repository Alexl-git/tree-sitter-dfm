# tree-sitter-DFM — LOG

> Append-only decision log. First entry made by the autonomous loop's first DFM iteration.

---

## 2026-05-21  Bootstrap (interactive, attended)

**Goal**: prepare a clean from-scratch DFM grammar scaffold so the autonomous loop can pick it up if Pascal work plateaus.

**Created**:
- `grammar.js` (~140 lines): object/inherited/inline, qualified property names, string/numeric/boolean/identifier values, sets, lists, items collections, hex blobs.
- `tree-sitter.json`, `package.json`, `binding.gyp`, `bindings/node/binding.cc` + `index.{js,d.ts}`, copy of `binding_test.js`.
- `tools/build-manifest.ps1` (.dfm/.fmx file enumerator under the same corpus roots).
- `tools/parse-corpus.js`, `tools/summarize.js`, `tools/run-baseline.ps1` (copied from Pascal repo).
- Examples: minimal synthetic DFM forms (`simple-form.dfm`, `with-collection.dfm`).

**Verified**:
- `npm install --ignore-scripts` then `tree-sitter generate` → `src/parser.c` ~72 KB.
- `node-gyp rebuild` → `build/Release/tree_sitter_dfm_binding.node` 143 KB.
- Smoke parse of 2 real DFM files: both clean (0 errors).

**Decisions**:
- No git repo initialized yet. The loop's first DFM iteration will `git init`, add everything, and commit the scaffold as "feat: initial DFM grammar (boot scaffold)".
- DFM grammar is intentionally minimal. Loop iterations refine it.

---

## 2026-11-09  v1.2.0 -- Unicode identifiers (drag-lint wave 149 lane DF)

**Change**: `identifier` rule `[A-Za-z_][A-Za-z0-9_]*` -> `[\p{L}\p{Nl}_][\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}_]*`; `object btnUeber: TButton` (real U-umlaut) no longer lexes as `btn` + stray token.

**Why**: drag-lint stored such a component under its ASCII prefix, so `convert-apply --only` could not find the block (148 CV NEXT-BUMP).

**Verified**: regenerated with tree-sitter 0.24.7 (parser.c 91 KB); drag-lint fixtures Windows-1252 + UTF-8/BOM store the full names; corpus A/B in the lane report.

---
