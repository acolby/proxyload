# Build Module

The build module provides the core functionality for building Proxyload-compatible code according to the [Proxyload specification](../../README.md).

## Overview

This module takes your proxied directory structure and builds each entry point into individual JavaScript files that can be dynamically loaded at runtime. Each built file follows the Proxyload standard of being assigned to the global namespace. The build process also generates a manifest file organized under release keys for version management.

## Basic Usage

```typescript
import build from "./build";

await build({
  dir: "./src/proxied",
  dist: "./dist",
  globals: { react: "React" },
  key: "latest", // Release key for organizing build artifacts
});
```

## Configuration

The build function accepts the following configuration:

- `dir`: Source directory containing your proxied code structure
- `dist`: Output directory for built files
- `globals`: Map of module specifiers to global variable names
- `key`: Release key for organizing build artifacts under `_releases/{key}/manifest.json`
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
  key: "v1.0.0", // Release key for this build
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

The build process creates the following structure:

```
dist/
├── items/
│   └── [TYPE]/
│       └── [NAME]/
│           └── [VARIATION]/
│               └── [VERSION].js
└── _releases/
    └── [KEY]/
        ├── manifest.json
        ├── index.js
        └── loaders.js
```

Each built file contains code that assigns the module to the global namespace:

```javascript
globalThis._PL_.items["Component/Button/default/latest"] = (() => {
  // Your bundled code here
  return Button;
})();
```

### Release Files

The build process generates several files under the release key:

**manifest.json** - Maps module paths to their versions:

```json
{
  "Component/Button": "abc123def456",
  "Component/Header": "def456ghi789",
  "api/auth": "ghi789jkl012"
}
```

**index.js** - Sets up the global structure for runtime loading:

```javascript
globalThis._PL_ = globalThis._PL_ || { items: {}, releases: {}, current: null };
globalThis._PL_.current = "latest";
globalThis._PL_.releases["latest"] = {
  manifest: {
    /* version mappings */
  },
  loaders: {
    /* loader mappings */
  },
  globals: {
    /* global variables */
  },
};
```

**loaders.js** - Contains the loader implementations for each type.

These files work together to enable the load utility to automatically resolve modules and versions at runtime.

## Global Structure

The build utility creates a structured global object that organizes all your proxied code:

- `globalThis._PL_.items` - Contains all built modules, accessible by their full path
- `globalThis._PL_.releases[key].manifest` - Maps module paths to their versions
- `globalThis._PL_.releases[key].loaders` - Maps type names to their loader implementations
- `globalThis._PL_.releases[key].globals` - Contains global variables for the release
- `globalThis._PL_.current` - Tracks the currently active release

This structure is automatically set up by the build process and allows the load utility to seamlessly access modules without manual configuration.

## Release Key Management

The release key system enables:

- **Version Control**: Organize builds under meaningful release keys (e.g., "latest", "v1.0.0", "staging")
- **Deployment Management**: Deploy specific releases independently
- **Rollback Capability**: Quickly switch between different releases
- **Type Coordination**: Coordinate with TypeGen to ensure types match the deployed code

## Integration with Other Utilities

The build utility works seamlessly with other Proxyload utilities:

- **TypeGen**: Generates `types.json` under the same release key structure
- **Load Utility**: Uses the manifest to resolve module versions at runtime
- **TypeSync**: Fetches type definitions from the corresponding release key

For more details on the Proxyload specification and directory structure, see the [main README](../../README.md).
