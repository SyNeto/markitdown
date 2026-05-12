# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build commands

```bash
# Install dependencies
npm install

# Type-check only (no emit)
npm run typecheck

# Build both browser targets
npm run build:all

# Build a single target
npm run build:chromium   # → dist/chromium/
npm run build:firefox    # → dist/firefox/

# Package for distribution
npm run package:chromium  # → markitdown-<version>-chromium.zip
npm run package:firefox   # → markitdown-<version>-firefox.zip
npm run package           # clean + both zips

# Clean build artifacts
npm run clean
```

Node/npm are managed via nvm. Source it before running commands in shell:
```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
```

There are no tests and no linter configured yet.

## Architecture

This is a **Manifest V3 browser extension** written in TypeScript, bundled with Rollup.

### Source files

| File | Role |
|------|------|
| `src/content.ts` | Content script: detects Markdown pages, renders with marked, highlights with hljs, handles toggle |
| `src/background.ts` | Service worker / event page: handles toolbar icon click, relays toggle message, updates badge |
| `src/hljs-languages.ts` | Registers 30 highlight.js languages; exports configured `hljs` instance |
| `src/env.d.ts` | Ambient declarations; sanity-checks that `@types/chrome` and DOM lib are present |

### Runtime flow

```
User opens .md file / raw GitHub URL
  → content.ts auto-detects Markdown (extension, Content-Type, or bare <pre>)
  → renders with marked.parse() into a styled <article>
  → runs hljs.highlightElement() on every <pre><code>

User clicks toolbar icon
  → background.ts fires chrome.action.onClicked
  → sendMessage({action:"toggle"}) to the active tab
  → content.ts swaps between rendered HTML and original raw text
  → background.ts updates the badge ("RAW" or empty)
```

### Build pipeline

```
src/content.ts  ──Rollup (tree-shake) + esbuild (minify)──► dist/<browser>/content.bundle.js
src/background.ts ────────────────────────────────────────► dist/<browser>/background.js
```

`rollup.config.mjs` defines two entry points per browser. The `BROWSER` env var (`chromium` | `firefox` | `all`) selects which targets to build. Plugins: `@rollup/plugin-node-resolve` (browser field), `@rollup/plugin-commonjs` (needed for highlight.js CJS/ESM exports map), `rollup-plugin-esbuild` (TS transpile + minify).

hljs languages are registered explicitly in `src/hljs-languages.ts` — do not switch to the full bundle import or the size balloons from ~176 KB to ~1 MB.

### Two-browser build strategy

`build/manifest.chromium.json` and `build/manifest.firefox.json` are the canonical manifests. Key differences:

| Field | Chromium | Firefox |
|-------|----------|---------|
| `background` | `service_worker: "background.js"` | `scripts: ["background.js"]` |
| `browser_specific_settings` | absent | `gecko.id` + `strict_min_version` |

Firefox MV3 supports `chrome.*` natively — no polyfill needed.

### Content detection

`content.ts` bails out early if the page is not Markdown. Detection order:
1. URL has `.md` / `.markdown` / `.mdown` / `.mkd` extension
2. `Content-Type` is `text/markdown` or `text/x-markdown`
3. Heuristic: body contains a single `<pre>` child (plain-text served file)
