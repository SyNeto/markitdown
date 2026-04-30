// Entry point for esbuild: exposes marked as a global for the content script.
import { marked } from "marked";
window.marked = marked;
