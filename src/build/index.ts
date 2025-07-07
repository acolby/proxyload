import fs from "node:fs";
import path from "node:path";

import { build as esbuild } from "esbuild";

export default async function build(params: {
  // the base dir of the proxied code
  dir: string;
  // the base dir of the output
  dist: string;
}) {
  // find dir names in dir
  const dirNames = fs
    .readdirSync(params.dir)
    .filter((name) => !name.includes("."));

  for (const dirName of dirNames) {
    console.log("building", dirName);
  }

  // for each dir name, build the code
  // for (const dirName of dirNames) {
  //
  // const result = await esbuild({
  //   entryPoints: [entry],
  //   bundle: true,
  //   format: "esm",
  //   platform: "browser",
  //   target: "esnext",
  //   treeShaking: true,
  //   external: ["@/harness", "react"],
  //   // minify: true,
  //   banner: {
  //     js: banner,
  //   },
  //   footer: {
  //     js: "})();",
  //   },
  //   write: false,
  // });
  //
  // const preparsed = result.outputFiles[0].text;
  //
  // const dist = preparsed
  //   .replace(/^export\s+\{[^}]+\};?\s*$/gm, "return Item;")
  //   .replace(
  //     /^import\s+\{([^}]+)\}\s+from\s+["']@\/harness["'];?\s*$/gm,
  //     (_match, imports) => `const {${imports.trim()}} = globalThis.__HARNESS__;`
  //   );
  //
  // // @TODO implement minification and source-maps
  // // @TODO source-maps
  //
  // return dist;
}
