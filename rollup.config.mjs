import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const browser = process.env.BROWSER ?? "all";

const targets = {
  chromium: "chrome120",
  firefox: "firefox128",
};

function buildFor(name) {
  const target = targets[name];
  const plugins = [resolve({ browser: true }), commonjs(), esbuild({ target, minify: true })];

  return [
    {
      input: "src/content.ts",
      output: { file: `dist/${name}/content.bundle.js`, format: "iife", inlineDynamicImports: true },
      plugins,
    },
    {
      input: "src/background.ts",
      output: { file: `dist/${name}/background.js`, format: "iife" },
      plugins,
    },
  ];
}

const browsers = browser === "all" ? ["chromium", "firefox"] : [browser];

export default browsers.flatMap(buildFor);
