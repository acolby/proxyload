// scripts/build.js
import { build } from "esbuild";
import { rmSync, readFileSync } from "node:fs";

// pull in package.json
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const { exports } = packageJson;

const entryPoints = Object.entries(exports).map(([key, value]) => {
  return `src/${key}/index.ts`;
});

rmSync("dist", { recursive: true, force: true });

build({
  entryPoints,
  bundle: false,
  outdir: "dist",
  format: "esm",
  target: ["esnext"],
  jsx: "automatic",
  sourcemap: true,
  splitting: false,
  minify: false,
  tsconfig: "tsconfig.json",
}).catch(() => process.exit(1));
