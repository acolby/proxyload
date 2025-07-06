# Load Utility

A utility function that creates a nested proxy structure for dynamically loading and executing code based on type and name hierarchies.

## Overview

The `load` function creates a two-level proxy system where:

- First level: **Type** (e.g., "component", "service", "util")
- Second level: **Name** (e.g., "Button", "AuthService", "formatDate")

## Usage

```typescript
import load from "./index";

const proxied = load({
  host: "https://example.com",
  loaders: {
    // Loaders should also be served from the same project
    Component: "Loader/Component/default/latest",
    Util: "Loader/Compeont/default/latest",
  },
  globals: {
    // Global variables available to all loaded modules
  },
  references: {
    harness: "_PL_", // Global reference for the harness (default: '_PL_')
    items: "_PL_ITEMS_", // Global reference for loaders (default: '_PL_ITEMS_')
  },
  // A callback function that will be called any time a version is needed
  // This is usefule for manifest deploys
  getVersion: ({ type, name, variation }) => {
    // Custom version resolution logic
    return "latest";
  },
});

// Usage examples:

proxied.component.Button({ variation: "primary" });
const await proxied.util.formatDate({ variation: "short" });

```

## Parameters

- `host`: Base URL for loading resources
- `types`: Array of supported type categories
- `loaders`: Mapping of types to their corresponding loader functions
- `globals`: Global variables to make available to loaded modules
- `references`: Optional custom global reference names
- `getVersion`: Function to resolve version for a given type/name/variation

## How It Works

1. Creates a nested proxy structure: `Proxied[type][name]`
2. Each call resolves the appropriate loader based on type
3. Executes the loader with host, name, type, version, and variation parameters
4. Makes the proxy available globally via the harness reference

## Global References

The utility creates two global references:

- **Harness**: Contains the proxy structure and globals
- **Items**: Contains the loader functions for each type

These can be customized via the `references` parameter.
