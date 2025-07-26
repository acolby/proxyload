# Build Module

The build module provides the core functionality for building Proxyload-compatible code according to the [Proxyload specification](../../README.md) with dependency injection support.

## Overview

This module takes your proxied directory structure and builds each entry point into individual JavaScript files that can be dynamically loaded at runtime. Each built file follows the Proxyload standard of being wrapped in a dependency injection function. The build process also generates a hashes file organized under release keys for version management.

## Basic Usage

```typescript
import build from "@acolby/proxyload/src/build";

await build({
  dir: "./src/proxied",
  dist: "./dist",
  dependencies: { react: {} },
  key: "latest", // Release key for organizing build artifacts
  loaders: { Component: "Component/Button/default" },
});
```

## Configuration

The build function accepts the following configuration:

- `dir`: Source directory containing your proxied code structure
- `dist`: Output directory for built files
- `dependencies`: Map of module specifiers to dependency configurations
- `key`: Release key for organizing build artifacts under `releases/{key}/hashes.json`
- `plugins`: Optional esbuild plugins
- `esbuildOptions`: Optional esbuild configuration overrides
- `minify`: Whether to minify output (defaults to false)
- `loaders`: Map of type names to loader entry points
- `version`: Version string (defaults to esbuild version, can be overridden)

## Example with Plugins

```typescript
import build from "@acolby/proxyload/src/build";
import { cssModulesPlugin } from "esbuild-css-modules-plugin";

await build({
  dir: "./src/proxied",
  dist: "./dist",
  dependencies: {
    react: {},
    "react/jsx-runtime": {},
  },
  key: "v1.0.0", // Release key for this build
  plugins: [cssModulesPlugin()],
  esbuildOptions: {
    target: "es2020",
    sourcemap: true,
  },
  minify: true,
  loaders: { Component: "Component/Button/default" },
  // version: "custom-version-string", // Optional: override default version
});
```

## Output Structure

Built files follow the pattern: `items/[TYPE]/[NAME]/[VARIATION]/[VERSION].js`

The build process creates the following structure:

```
dist/
├── items/
│   └── [TYPE]/
│       └── [NAME]/
│           └── [VARIATION]/
│               └── [VERSION].js
└── releases/
    └── [KEY]/
        ├── hashes.json
        ├── server.js
        └── client.js
```

Each built file contains code that wraps the module in a dependency injection function:

```javascript
globalThis._PL_.items["Component/Button/default/esbuild-version"] = (
  _DI_PROXY_
) => {
  var React = _DI_PROXY_["react"];
  var { jsx, jsxs } = _DI_PROXY_["react/jsx-runtime"];

  // Your bundled code here
  const Button = (props) => {
    return jsx("button", { onClick: props.onClick, children: props.label });
  };

  return Button;
};
```

### Release Files

The build process generates several files under the release key:

**hashes.json** - Maps module paths to their versions:

```json
{
  "Component/Button": "abc123def456",
  "Component/Header": "def456ghi789",
  "api/auth": "ghi789jkl012"
}
```

**server.js** and **client.js** - Set up the global structure for runtime loading:

```javascript
globalThis._PL_ = globalThis._PL_ || { items: {}, releases: {}, current: null };
globalThis._PL_.releases["latest"] = {
  id: "latest",
  hashes: {
    /* version mappings */
  },
  loaders: {
    /* loader mappings */
  },
  dependencies: {
    /* dependency mappings */
  },
};
```

These files work together to enable the proxy utility to automatically resolve modules and versions at runtime with dependency injection.

## Dependency Injection

The build utility implements dependency injection by:

1. **Module Wrapping**: Each built module is wrapped in a function that receives `_DI_PROXY_` as a parameter
2. **Import Rewriting**: ES6 imports are transformed to read from the DI proxy instead of global namespace
3. **Runtime Injection**: Dependencies are injected at runtime through the proxy system

### Import Rewriting

When building, any import whose module specifier matches a key in the `dependencies` map will be rewritten to read from `_DI_PROXY_`. For example:

- `import React from "react";` becomes `var React = _DI_PROXY_["react"];`
- `import { jsx, jsxs } from "react/jsx-runtime";` becomes `var { jsx, jsxs } = _DI_PROXY_["react/jsx-runtime"];`

This enables runtime dependency injection and provides several benefits:

- **Isolation**: Modules don't depend on global state
- **Testability**: Dependencies can be easily mocked by passing different DI proxy objects
- **Flexibility**: Different dependency versions can be injected at runtime
- **Type Safety**: The DI proxy can be typed for better IDE support

### Example Transformation

```tsx
// Original code
import React from "react";
import { jsx, jsxs } from "react/jsx-runtime";

const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};

export default Button;
```

```js
// Built output with DI
globalThis._PL_.items["Component/Button/default/hash"] = (_DI_PROXY_) => {
  var React = _DI_PROXY_["react"];
  var { jsx, jsxs } = _DI_PROXY_["react/jsx-runtime"];

  const Button = (props) => {
    return jsx("button", { onClick: props.onClick, children: props.label });
  };

  return Button;
};
```

## Global Structure

The build utility creates a structured global object that organizes all your proxied code:

- `globalThis._PL_.items` - Contains all built modules wrapped in DI functions, accessible by their full path
- `globalThis._PL_.releases[key].hashes` - Maps module paths to their versions
- `globalThis._PL_.releases[key].loaders` - Maps type names to their loader implementations
- `globalThis._PL_.releases[key].dependencies` - Contains dependency mappings for the release
- `globalThis._PL_.current` - Tracks the currently active release

This structure is automatically set up by the build process and allows the proxy utility to seamlessly access modules without manual configuration while providing dependency injection capabilities.

## Versioning

By default, the version used in output paths is the esbuild version. You can override this by passing a custom `version` in the build options.

## Release Key Management

The release key system enables:

- **Version Control**: Organize builds under meaningful release keys (e.g., "latest", "v1.0.0", "staging")
- **Deployment Management**: Deploy specific releases independently
- **Rollback Capability**: Quickly switch between different releases
- **Type Coordination**: Coordinate with TypeGen to ensure types match the deployed code

## Integration with Other Utilities

The build utility works seamlessly with other Proxyload utilities:

- **TypeGen**: Generates `types.json` under the same release key structure
- **Proxy Utility**: Uses the hashes to resolve module versions at runtime with DI support
- **TypeSync**: Fetches type definitions from the corresponding release key

For more details on the Proxyload specification and directory structure, see the [main README](../../README.md).
