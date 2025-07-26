import fs from "node:fs";
import path from "node:path";

import { build as esbuild } from "esbuild";
import { BuildParams, Release, ReleasesData } from "../types";

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
 *   ** Override import statements that are passed in as dependencies at runtime
 *   dependencies: { 'react': { * left empty for now * } },
 *   plugins: [cssModulesPlugin()],
 *   esbuildOptions: {
 *     target: 'es2020',
 *     sourcemap: true,
 *   },
 *   minify: true,
 * });
 * ```
 */

export default async function build(params: BuildParams) {
  // Ensure the dist directory exists
  fs.mkdirSync(params.dist, { recursive: true });

  const namespace = "_PL_";
  const entryPoints = await _getEntryPoints(params);

  const hashes: Record<string, string> = {};

  const dependencies = {
    ...params.dependencies,
    [params.proxyRef]: {},
  };

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
      external: Object.keys(dependencies),

      // @TODO: minify
      minify: params.minify ?? false,
      write: false,

      // Allow custom esbuild options to override defaults
      ...params.esbuildOptions,

      // Allow custom plugins
      plugins: params.plugins || [],
    });

    // I need to URL sanitize the hash
    const hash =
      result.outputFiles?.[0]?.hash.replace(/[^a-zA-Z0-9]/g, "-") || "";
    hashes[entryPoint.split("/").slice(0, -1).join("/")] = hash;

    if (!result.outputFiles || result.outputFiles.length === 0) {
      throw new Error(
        `No output files generated for entry point: ${entryPoint}`
      );
    }

    let code = result.outputFiles[0].text;

    // rewrite globals
    code = _rewriteImports(code, Object.keys(dependencies));
    // rewrite exports
    code = code.replace(
      /export\s*{\s*([a-zA-Z_$][\w$]*)\s+as\s+default\s*};?/,
      "return $1;"
    );

    const ref = `${path.dirname(entryPoint)}/${hash}`;
    code = `globalThis.${namespace}.items["${ref}"] = (_DI_PROXY_) => { ${code} };`;

    const dest = `${params.dist}/items/${ref}.js`;
    // write to dist making sure the dir exists
    fs.mkdirSync(path.dirname(dest), {
      recursive: true,
    });

    fs.writeFileSync(dest, code);
  }

  // BUILD THE RELEASE FILES
  // now write the hashes.json
  const dest = path.resolve(params.dist, "releases", params.key, "hashes.json");
  // make sure the dir exists
  fs.mkdirSync(path.dirname(dest), {
    recursive: true,
  });
  fs.writeFileSync(dest, JSON.stringify(hashes, null, 2));

  const loadersWithHash = Object.entries(params.loaders).reduce(
    (acc, [key, value]) => {
      acc[key] = `${value}/${hashes[value]}`;
      return acc;
    },
    {} as Record<string, string>
  );

  const release: Release = {
    id: params.key,
    hashes: hashes,
    loaders: loadersWithHash,
    dependencies: dependencies,
  };

  // --- Update top-level releases.json ---
  const releasesJsonPath = path.resolve(params.dist, "releases.json");
  let releasesData: ReleasesData = { releases: {} };
  if (fs.existsSync(releasesJsonPath)) {
    try {
      releasesData = JSON.parse(fs.readFileSync(releasesJsonPath, "utf8"));
    } catch (e) {
      // If file is corrupted, re-initialize
      releasesData = { releases: {} };
    }
  }
  const now = new Date().toISOString();
  if (releasesData.releases[params.key]) {
    // Update only updatedAt
    releasesData.releases[params.key].updatedAt = now;
  } else {
    // New release: set both createdAt and updatedAt
    releasesData.releases[params.key] = { createdAt: now, updatedAt: now };
  }
  fs.writeFileSync(releasesJsonPath, JSON.stringify(releasesData, null, 2));

  // Add createdAt and updatedAt to the release object
  const { createdAt, updatedAt } = releasesData.releases[params.key];
  release.createdAt = createdAt;
  release.updatedAt = updatedAt;

  // write the server release entry
  fs.writeFileSync(
    path.resolve(params.dist, "releases", params.key, "server.js"),
    `globalThis.${namespace} = globalThis.${namespace} || { items: {}, releases: {} };
globalThis.${namespace}.releases["${params.key}"] = ${JSON.stringify(
      release,
      null,
      2
    )};
`
  );

  // write the server release entry
  let clientCode = `globalThis.${namespace} = globalThis.${namespace} || { items: {}, releases: {} };
globalThis.${namespace}.releases["${params.key}"] = ${JSON.stringify(
    release,
    null,
    2
  )};
globalThis.${namespace}.current = "${params.key}";
`;

  for (const loader of Object.values(params.loaders)) {
    const entry = loader;
    const hash = hashes[entry];
    const src = `${params.dist}/items/${entry}/${hash}.js`;
    const code = fs.readFileSync(src, "utf8");
    clientCode += "\n" + code;
  }

  fs.writeFileSync(
    path.resolve(params.dist, "releases", params.key, "client.js"),
    clientCode
  );

  const { hashes: _, ...meta } = release;

  fs.writeFileSync(
    path.resolve(params.dist, "releases", params.key, "meta.json"),
    JSON.stringify(meta, null, 2)
  );

  return hashes;
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
 *   const { jsx, jsxs } = _DI_PROXY_["react/jsx-runtime"];
 *
 *   import { Component } from "@proxied";
 *   // ───────▼──────────────────────────────────
 *   const { Component } = _DI_PROXY_["@proxied"];
 *
 * @param code  The original file contents
 * @param remap A map from module specifier ➜ global slot
 */
export function _rewriteImports(code: string, remap: string[]): string {
  return code
    .replace(
      /import\s*{([^}]+)}\s*from\s*["']([^"']+)["'];?/g,
      (full, imports, source) => {
        const inject = remap.find((dep) => source.includes(dep));
        if (!inject) return full;

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

        return `var { ${transformedImports} } = _DI_PROXY_["${inject}"];`;
      }
    )
    .replace(
      /import\s+([a-zA-Z_$][\w$]*)\s*from\s*["']([^"']+)["'];?/g,
      (full, name, source) => {
        const inject = remap.find((dep) => source.includes(dep));
        if (!inject) return full;

        return `var ${name} = _DI_PROXY_["${inject}"];`;
      }
    );
}
