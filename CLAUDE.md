# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build commands

```bash
# Install dependencies
npm install

# Build both browser targets
npm run build:all

# Build a single target
npm run build:chromium
npm run build:firefox

# Package for distribution (.zip artifacts)
npm run package:chromium   # → markitdown-<version>-chromium.zip
npm run package:firefox    # → markitdown-<version>-firefox.zip
npm run package            # clean + both zips

# Clean build artifacts
npm run clean
```

Node/npm are managed via nvm. Source it before running commands in shell:
```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
```

There are no tests and no linter configured yet.

## Architecture

This is a **Manifest V3 browser extension** with two content scripts and one background (service worker / event-page) script.

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

### Two-browser build strategy

`build/manifest.chromium.json` and `build/manifest.firefox.json` are the canonical manifests. The only structural differences between them:

| Field | Chromium | Firefox |
|-------|----------|---------|
| `background` | `service_worker` | `scripts[]` |
| `browser_specific_settings` | absent | `gecko.id` + `strict_min_version` |

Both use MV3. Firefox MV3 supports `chrome.*` natively so the source uses `chrome.` throughout — no polyfill.

Build scripts (`build:chromium` / `build:firefox`) compile vendor bundles, then copy `src/`, `styles/`, `icons/`, the minified vendor bundles, and the correct manifest into `dist/<browser>/`. `dist/` is gitignored.

### Vendor bundling

`vendor/marked-entry.js` and `vendor/hljs-entry.js` are esbuild entry points that bundle their respective libraries as IIFE globals (`window.marked`, `window.hljs`). These are injected before `src/content.js` in the manifest's `content_scripts` array so they are available as globals at runtime.

hljs languages are registered explicitly in `hljs-entry.js` — do not switch to the full bundle import or the size balloons from ~135 KB to ~1 MB.

### Content detection

`content.js` bails out early if the page is not Markdown. Detection order:
1. URL has `.md` / `.markdown` / `.mdown` / `.mkd` extension
2. `Content-Type` response header is `text/markdown` or `text/x-markdown`
3. Heuristic: body contains a single `<pre>` child (plain-text served file)

### Permissions

Only `activeTab` is declared. The content script match patterns (`file:///*`, `raw.githubusercontent.com`, `gist.githubusercontent.com`) gate injection — no host permission is needed for messaging.
