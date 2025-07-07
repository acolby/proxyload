# Build Module

The build module provides the core functionality for building Proxyload-compatible code according to the [Proxyload specification](../../README.md).

## Overview

This module takes your proxied directory structure and builds each entry point into individual JavaScript files that can be dynamically loaded at runtime. Each built file follows the Proxyload standard of being assigned to the global namespace.

## Basic Usage

```typescript
import build from "./build";

await build({
  dir: "./src/proxied",
  dist: "./dist",
  globals: { react: "React" },
});
```

## Configuration

The build function accepts the following configuration:

- `dir`: Source directory containing your proxied code structure
- `dist`: Output directory for built files
- `globals`: Map of module specifiers to global variable names
- `plugins`: Optional esbuild plugins
- `esbuildOptions`: Optional esbuild configuration overrides
- `version`: Version string (defaults to "latest")
- `minify`: Whether to minify output (defaults to false)

## Example with Plugins

```typescript
import build from "./build";
import { cssModulesPlugin } from "esbuild-css-modules-plugin";

await build({
  dir: "./src/proxied",
  dist: "./dist",
  globals: { react: "React" },
  plugins: [cssModulesPlugin()],
  esbuildOptions: {
    target: "es2020",
    sourcemap: true,
  },
  minify: true,
  version: "v1.0.0",
});
```

## Output Structure

Built files follow the pattern: `[TYPE]/[NAME]/[VARIATION]/[VERSION].js`

Each file contains code that assigns the module to the global namespace:

```javascript
globalThis._PL_ITEMS_["Component/Button/default/latest"] = (() => {
  // Your bundled code here
  return Button;
})();
```

For more details on the Proxyload specification and directory structure, see the [main README](../../README.md).
