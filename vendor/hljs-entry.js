// Entry point for esbuild: builds a highlight.js bundle with common languages.
// We register languages explicitly instead of importing the full package
// to keep the bundle small (~180kb vs ~1MB).

import hljs from "highlight.js/lib/core";

// Web fundamentals
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml"; // also covers HTML
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";

// Backend / systems
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";

// Scripting / config
import bash from "highlight.js/lib/languages/bash";
import shell from "highlight.js/lib/languages/shell";
import powershell from "highlight.js/lib/languages/powershell";
import yaml from "highlight.js/lib/languages/yaml";
import ini from "highlight.js/lib/languages/ini"; // also covers TOML
import dockerfile from "highlight.js/lib/languages/dockerfile";

// Data / query
import sql from "highlight.js/lib/languages/sql";
import graphql from "highlight.js/lib/languages/graphql";

// Markup / docs
import markdown from "highlight.js/lib/languages/markdown";
import latex from "highlight.js/lib/languages/latex";

// Other common
import diff from "highlight.js/lib/languages/diff";
import makefile from "highlight.js/lib/languages/makefile";
import nginx from "highlight.js/lib/languages/nginx";
import plaintext from "highlight.js/lib/languages/plaintext";
import lua from "highlight.js/lib/languages/lua";
import r from "highlight.js/lib/languages/r";
import perl from "highlight.js/lib/languages/perl";
import scala from "highlight.js/lib/languages/scala";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);

hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cs", csharp);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("rs", rust);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", c);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("rb", ruby);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("kt", kotlin);

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("zsh", bash);
hljs.registerLanguage("shell", shell);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("ps1", powershell);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("toml", ini);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("docker", dockerfile);

hljs.registerLanguage("sql", sql);
hljs.registerLanguage("graphql", graphql);
hljs.registerLanguage("gql", graphql);

hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("latex", latex);
hljs.registerLanguage("tex", latex);

hljs.registerLanguage("diff", diff);
hljs.registerLanguage("makefile", makefile);
hljs.registerLanguage("make", makefile);
hljs.registerLanguage("nginx", nginx);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);
hljs.registerLanguage("txt", plaintext);
hljs.registerLanguage("lua", lua);
hljs.registerLanguage("r", r);
hljs.registerLanguage("perl", perl);
hljs.registerLanguage("pl", perl);
hljs.registerLanguage("scala", scala);

window.hljs = hljs;
