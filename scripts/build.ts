// scripts/build.js
import { build } from "esbuild";
import { rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

// pull in package.json
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const { exports } = packageJson;

const entryPoints = Object.entries(exports)
  .filter(([key]) => key !== ".") // Skip the root export
  .map(([key, value]) => {
    return `src/${key}/index.ts`;
  });

rmSync("dist", { recursive: true, force: true });

await build({
  entryPoints,
  bundle: false,
  outdir: "dist",
  format: "cjs",
  target: ["esnext"],
  jsx: "automatic",
  sourcemap: true,
  splitting: false,
  minify: false,
  tsconfig: "tsconfig.json",
}).catch(() => process.exit(1));

// Run tsc to emit only declaration files
const tscResult = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "tsc",
    "--emitDeclarationOnly",
    "--declaration",
    "--project",
    "tsconfig.json",
  ],
  { stdio: "inherit" }
);

if (tscResult.status !== 0) {
  console.error("TypeScript declaration emit failed.");
  process.exit(tscResult.status || 1);
}
