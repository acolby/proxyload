import fs from "node:fs";
import path from "node:path";

import { build as esbuild, Plugin, BuildOptions } from "esbuild";

export interface BuildParams {
  dir: string;
  dist: string;
  globals: Record<string, string>;
  key: string;
  loaders: Record<string, string>;
  plugins?: Plugin[];
  esbuildOptions?: Partial<BuildOptions>;
  version?: string;
  minify?: boolean;
}

/**
 * Example usage:
 *
 * ```typescript
 * import build from './build';
 * import { cssModulesPlugin } from 'esbuild-css-modules-plugin';
 *
 * await build({
 *   dir: './src',
 *   dist: './dist',
 *   globals: { 'react': 'React' },
 *   plugins: [cssModulesPlugin()],
 *   esbuildOptions: {
 *     target: 'es2020',
 *     sourcemap: true,
 *   },
 *   minify: true,
 *   version: 'v1.0.0-{hash}' // {hash} will be replaced with the actual build hash
 * });
 * ```
 */

export default async function build(params: BuildParams) {
  // Ensure the dist directory exists
  fs.mkdirSync(params.dist, { recursive: true });

  const entryPoints = await _getEntryPoints(params);
  const manifest: Record<string, string> = {};

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
      minify: params.minify ?? false,
      write: false,

      // Allow custom esbuild options to override defaults
      ...params.esbuildOptions,

      // Allow custom plugins
      plugins: params.plugins || [],
    });

    // I need to URL sanitize the hash
    const hash = result.outputFiles?.[0]?.hash.replace(/[^a-zA-Z0-9]/g, "-");

    let version = params.version || "HASH";

    if (hash) {
      version = version.replace("HASH", hash);
    }

    manifest[entryPoint.split("/").slice(0, -1).join("/")] = version;

    if (!result.outputFiles || result.outputFiles.length === 0) {
      throw new Error(
        `No output files generated for entry point: ${entryPoint}`
      );
    }

    let code = result.outputFiles[0].text;

    // rewrite globals
    code = _rewriteImports(code, params.globals);
    // rewrite exports
    code = code.replace(
      /export\s*{\s*([a-zA-Z_$][\w$]*)\s+as\s+default\s*};?/,
      "return $1;"
    );

    const ref = `${path.dirname(entryPoint)}/${version}`;
    code = `globalThis._PL_.items["${ref}"] = (() => { ${code} })();`;

    const dest = `${params.dist}/items/${ref}.js`;
    // write to dist making sure the dir exists
    fs.mkdirSync(path.dirname(dest), {
      recursive: true,
    });

    fs.writeFileSync(dest, code);
  }

  // BUILD THE RELEASE FILES
  // now write the manifest.json
  const dest = path.resolve(
    params.dist,
    "releases",
    params.key,
    "manifest.json"
  );
  // make sure the dir exists
  fs.mkdirSync(path.dirname(dest), {
    recursive: true,
  });
  fs.writeFileSync(dest, JSON.stringify(manifest, null, 2));

  const loadersWithVersion = Object.entries(params.loaders).reduce(
    (acc, [key, value]) => {
      // @ts-ignore
      acc[key] = `${value}/${manifest[value]}`;
      return acc;
    },
    {}
  );

  // write the release entry
  fs.writeFileSync(
    path.resolve(params.dist, "releases", params.key, "index.js"),
    `globalThis._PL_ = globalThis._PL_ || { items: {}, releases: {} };
globalThis._PL_.releases["${params.key}"] = {
id: "${params.key}",
manifest: ${JSON.stringify(manifest, null, 2)},
loaders: ${JSON.stringify(loadersWithVersion, null, 2)},
globals: ${JSON.stringify(params.globals, null, 2)},
};
`
  );

  // write release loaders
  let loadersCode =
    "globalThis._PL_ = globalThis._PL_ || { items: {}, releases: {} };";
  for (const loader of Object.values(params.loaders)) {
    const entry = loader;
    const version = manifest[entry];
    const src = `${params.dist}/items/${entry}/${version}.js`;
    const code = fs.readFileSync(src, "utf8");
    loadersCode += code;
  }

  fs.writeFileSync(
    path.resolve(params.dist, "releases", params.key, "loaders.js"),
    loadersCode
  );

  return manifest;
}

async function _getEntryPoints(params: Pick<BuildParams, "dir">) {
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

        // Transform import names to handle "as" syntax
        const transformedImports = imports
          .split(",")
          .map((importItem: string) => {
            const trimmed = importItem.trim();
            // Match pattern: "originalName as aliasName" or just "name"
            const asMatch = trimmed.match(
              /^([a-zA-Z_$][\w$]*)\s+as\s+([a-zA-Z_$][\w$]*)$/
            );
            if (asMatch) {
              // Convert "originalName as aliasName" to "originalName: aliasName"
              return `${asMatch[1]}: ${asMatch[2]}`;
            }
            return trimmed;
          })
          .join(", ");

        return `var { ${transformedImports} } = globalThis.${global};`;
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
