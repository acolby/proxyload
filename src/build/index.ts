import fs from "node:fs";
import path from "node:path";

import { build as esbuild } from "esbuild";

export default async function build(params: {
  dir: string;
  dist: string;
  globals: Record<string, string>;
}) {
  const entryPoints = await _getEntryPoints(params);

  const version = "latest";

  for (const entryPoint of entryPoints) {
    const result = await esbuild({
      // set base dir
      absWorkingDir: params.dir,
      entryPoints: [path.resolve(params.dir, entryPoint)],
      bundle: true,
      format: "esm",
      platform: "neutral",
      target: "esnext",

      treeShaking: true,
      external: Object.keys(params.globals),

      // @TODO: minify
      minify: false,
      write: false,
    });

    let code = result.outputFiles[0].text;

    // rewrite globals
    code = _rewriteImports(code, params.globals);
    // rewrite exports
    code = code.replace(
      /export\s*{\s*([a-zA-Z_$][\w$]*)\s+as\s+default\s*};?/,
      "return $1;"
    );

    const ref = `${path.dirname(entryPoint)}/${version}`;
    code = `globalThis._PL_ITEMS_["${ref}"] = (() => { ${code} })();`;

    const dest = `${params.dist}/${ref}.js`;
    // write to dist making sure the dir exists
    fs.mkdirSync(path.dirname(dest), {
      recursive: true,
    });

    fs.writeFileSync(dest, code);
  }
}

async function _getEntryPoints(params: { dir: string }) {
  // find dir names in dir
  const typeNames = fs
    .readdirSync(params.dir)
    .filter((name) => !name.includes("."));

  const entryPoints: string[] = [];

  for (const typeName of typeNames) {
    const itemNames = fs
      .readdirSync(path.resolve(params.dir, typeName))
      .filter((name) => !name.includes("."));

    for (const itemName of itemNames) {
      const variations = fs
        .readdirSync(path.resolve(params.dir, typeName, itemName))
        .filter((name) => !name.includes("."));

      for (const variation of variations) {
        // is entry point index.ts or index.tsx
        const entryPoint = fs.existsSync(
          path.resolve(params.dir, typeName, itemName, variation, "index.ts")
        )
          ? "index.ts"
          : "index.tsx";

        entryPoints.push(`${typeName}/${itemName}/${variation}/${entryPoint}`);
      }
    }
  }
  return entryPoints;
}

/**
 * Re-writes `import … from "…"` lines so that the bindings are read
 * from `globalThis.<TARGET>`, where `<TARGET>` is looked-up in the
 * `remap` table.
 *
 * Only the lines whose *module specifier* is present in `remap`
 * are changed; every other line is left untouched.
 *
 *   import { jsx, jsxs } from "react/jsx-runtime";
 *   // ────────────────▼──────────────────────────
 *   const { jsx, jsxs } = globalThis.JSX;
 *
 *   import { Component } from "@proxied";
 *   // ───────▼──────────────────────────────────
 *   const { Component } = globalThis._PROXIED_;
 *
 * @param code  The original file contents
 * @param remap A map from module specifier ➜ global slot
 */
export function _rewriteImports(
  code: string,
  remap: Record<string, string>
): string {
  return code
    .replace(
      /import\s*{([^}]+)}\s*from\s*["']([^"']+)["'];?/g,
      (full, imports, source) => {
        const global = remap[source];
        if (!global) return full;

        return `var { ${imports.trim()} } = globalThis.${global};`;
      }
    )
    .replace(
      /import\s+([a-zA-Z_$][\w$]*)\s*from\s*["']([^"']+)["'];?/g,
      (full, name, source) => {
        const global = remap[source];
        if (!global) return full;

        return `var ${name} = globalThis.${global};`;
      }
    );
}
