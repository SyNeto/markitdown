// Ambient declarations for the extension environment.
// Expand as needed when migrating source files to TypeScript.

// Sanity-check that the expected type packages are installed and visible.
// If any of these fail, the TypeScript setup is broken — fix before proceeding.
type _CheckChrome = typeof chrome.action;          // requires @types/chrome
type _CheckDOM    = typeof document.createElement; // requires lib: DOM
