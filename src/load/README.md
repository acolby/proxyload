# Load Utility

A utility function that creates a nested proxy structure for dynamically loading and executing code based on type and name hierarchies.

## Overview

The `load` function creates a two-level proxy system where:

- First level: **Type** (e.g., "Component", "Service", "Util")
- Second level: **Name** (e.g., "Button", "AuthService", "formatDate")

The function automatically retrieves loader mappings and manifest data from the release object, simplifying the configuration.

## Usage

```typescript
import load from "./index";

const proxied = load({
  host: "https://example.com",
  globals: {
    // Global variables available to all loaded modules
  },
});

// Usage examples:

proxied.Component.Button({ variation: "primary" });
const result = await proxied.Util.formatDate({ variation: "short" });
```

## Parameters

- `host`: Base URL for loading resources
- `globals`: Global variables to make available to loaded modules
- `namespace`: Optional custom namespace (defaults to "_PL_")

## How It Works

1. Creates a nested proxy structure: `Proxied[type][name]`
2. Automatically retrieves loader mappings from `globalThis._PL_.releases[key].loaders`
3. Retrieves version information from `globalThis._PL_.releases[key].manifest`
4. Executes the appropriate loader with host, name, type, version, and variation parameters
5. Makes the proxy available globally via the namespace reference

## Global Structure

The load utility works with the following global structure created by the build process:

- `globalThis._PL_.items` - Contains all loaded modules
- `globalThis._PL_.releases[key].loaders` - Contains loader mappings for each type
- `globalThis._PL_.releases[key].manifest` - Contains version mappings for modules
- `globalThis._PL_.releases[key].globals` - Contains global variables for the release

This structure is automatically set up by the build utility and allows for seamless runtime loading without manual configuration.
