# MarkItDown

A browser extension that renders Markdown files directly in the browser with
GitHub-style themes (light/dark) and GFM support. Builds are produced for both
Chromium-based browsers (Chrome, Brave, Edge, …) and Firefox.

## Features

- Renders `.md`, `.markdown`, `.mdown`, `.mkd` files opened locally or from the web
- Works on `raw.githubusercontent.com` and `gist.githubusercontent.com`
- GitHub Flavored Markdown: tables, task lists, strikethrough, autolinks
- Syntax highlighting in fenced code blocks via `highlight.js` (auto-detects language)
- Automatic light/dark theme following system preference
- Toggle between rendered and raw view via toolbar icon
- No network requests — fully offline, no telemetry

## Install (developer mode)

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build for your target browser (or both):
   ```bash
   npm run build:chromium   # → dist/chromium/
   npm run build:firefox    # → dist/firefox/
   npm run build:all        # both at once
   ```

### Chromium-based browsers (Chrome, Brave, Edge, …)

1. Open `brave://extensions` (or `chrome://extensions`, `edge://extensions`).
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select `dist/chromium/`.
4. **For local files**: click **Details** on the MarkItDown card and enable
   **Allow access to file URLs**.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `dist/firefox/manifest.json`.
3. **For local files**: open `about:addons`, click MarkItDown, and grant the
   file access permission (Firefox prompts on first navigation to a `file://`
   URL).

> Temporary add-ons are removed when Firefox restarts. To install permanently,
> use Firefox Developer Edition / Nightly with `xpinstall.signatures.required`
> disabled, or submit a signed build to AMO.

## Usage

- Open any `.md` file locally (`file:///...`) or a raw Markdown URL.
- The extension automatically renders the Markdown.
- Click the extension icon in the toolbar to toggle between rendered and raw view.
- The badge shows **RAW** when viewing the source text.

## Project structure

```
markitdown/
├── build/
│   ├── manifest.chromium.json  # MV3 manifest for Chromium-like browsers
│   └── manifest.firefox.json   # MV3 manifest for Firefox (scripts[] + gecko.id)
├── src/
│   ├── background.ts      # Toolbar icon click handling (service worker / event page)
│   ├── content.ts         # Content script: detection, rendering, toggle
│   ├── hljs-languages.ts  # highlight.js language registrations (30 languages)
│   └── env.d.ts           # Ambient type declarations
├── styles/
│   ├── markdown.css       # GitHub-style light/dark theme CSS
│   └── hljs-theme.css     # highlight.js theme (light/dark via prefers-color-scheme)
├── icons/                 # Extension icons (16, 48, 128px)
├── dist/                  # Per-browser build output (gitignored)
│   ├── chromium/          # Load unpacked here for Chrome/Brave/Edge
│   └── firefox/           # Load temporary add-on from here for Firefox
├── rollup.config.mjs      # Rollup bundle config (content.ts + background.ts per browser)
├── tsconfig.json          # TypeScript config (strict, moduleResolution: bundler)
├── package.json           # Node.js project with build scripts
└── README.md
```

## Packaging for distribution

```bash
npm run package:chromium   # → markitdown-<version>-chromium.zip
npm run package:firefox    # → markitdown-<version>-firefox.zip
npm run package            # both (after a clean)
```

## Permissions

| Permission  | Why |
|-------------|-----|
| `activeTab` | Allows the service worker to send a toggle message to the active tab when the user clicks the extension icon. |

The extension declares `content_scripts` match patterns for `file:///*`,
`*://raw.githubusercontent.com/*`, and `*://gist.githubusercontent.com/*` to
automatically inject the renderer on Markdown pages.

## Roadmap

- Persistent interactive checkboxes in task lists (keyed by document hash)
- KaTeX math rendering (`$...$` and `$$...$$`)
- Mermaid diagrams (` ```mermaid ` fences)
- Optional table of contents, heading anchors
