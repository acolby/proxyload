# @acolby/proxyload

**Proxyload** is a structural standard and toolkit for organizing, typing, versioning, and deploying modular TypeScript code at scale.

This standard flips the paradigm of how large projects are managed by simplifying and standardizing build-time artifacts, while allowing for customizable runtime loaders.

## 📁 Using Proxyload

Once a project is Proxyloaded, code is consumed via a recursive proxy object as follows:

```tsx
// src/Component/Landing/default/index.tsx
import { React, Component } from './@harness';

const Landing = () => {
  return (
    <Component.Header />
    <Component.Hero />
    <Component.Products />
    <>...</>
    <Component.Footer />
  );
};

export default Landing;
```

There is no tree-shaking here. Instead, `Component` is dynamically swapped at runtime and proxy loaded. Instead of relying on complex bundlers and static analyzers, custom runtime loaders selectively pull in code as needed.

## 🤯 Why?!

This approach unlocks powerful runtime capabilities:

- Runtime interop for both SSR and CSR
- Predictable asset caching (client and server)
- Manifest-based deploys
- Extremely fast builds
- Injectable middleware for various code types

## ⚙️ How it Works

It starts with conventions. This repository provides tools for maintaining Proxyloadable code.

### 📁 Directory Convention

The Arbiter standard enforces a clear 4-level structure inside your `src/` folder:

```
/src
  /[TYPE]                # High-level category (e.g. 'api', 'Component', 'task')
    /[NAME]              # Specific item within the category (e.g. 'checkout', 'logger')
      interface.ts       # Defines Params, Returns, and Interface
      /[VARIATION]       # Optional: One or more variations for experimentation
        index.ts(x)      # Each variation must include an index file
```

> 🧠 **Example:**
>
> ```
> /src
>   /Component
>     /Button
>       interface.ts    # MUST include an interface definition
>       /default        # MUST include a default variation
>         index.tsx     # MUST export a default implementation
>       /secondary
>         index.tsx
> ```

### 📐 `interface.ts` Contract

Each `[NAME]` folder **must include** an `interface.ts` file which defines the module's shape:

```ts
// src/Component/Button/interface.ts

export type Params = {
  label: string;
  onClick?: () => void;
};

export type Returns = JSX.Element;

export type Interface = (params: Params) => Returns;
```

All implementations must conform to this interface. This ensures consistency and allows tools to safely reason about modules.

### 📐 `index.ts|tsx` Contract

Each `[VERSION]` folder **must include** an `index.ts|tsx` that implements the interface and exports it as default:

```tsx
// src/Component/Button/default/index.tsx
import type { Interface } from "../interface";

const Button: Interface = (props) => {
  return <button onClick={props?.onClick}>{props.label}</button>;
};

export default Button;
```

---

## 🛠️ Building, Serving, and Running Code

Each entry point is expected to be built and output individually using the following structure:

```
[TYPE]/[NAME]/[VARIATION]/[VERSION].js
```

Each build artifact should assign a variable to the global namespace:

```js
globalThis._PL_ITEMS_["[TYPE]/[NAME]/[VARIATION]/[VERSION]"] = (() => {
  // implementation here...
  return Button;
})();
```

Use the build wrapper to wrap an ESM module according to the `index` standard above (see `src/buildwrapper/README.js`).

By default, the variation is `default` and the version is `latest`.

You can load any item dynamically using the `@acolby/proxyload/load` function. See `src/load/README.md`.

**Note:** You are responsible for implementing custom loaders per `[TYPE]`.

---

## ✅ Core Principles

- **Encapsulation**: Each component is self-contained with types and logic.
- **Contract-Driven**: Type-safe interfaces ensure correctness.
- **Variation-Ready**: Built-in support for A/B testing.
- **Versioned**: All variations follow `[TYPE]/[NAME]/[VARIATION]/[VERSION].js`.
- **Tooling-Oriented**: Auto-discoverable by Arbiter-compatible tools.
- **Runtime-Interop**: Swappable at runtime if the contract is upheld.

---

## 🚧 Status

This is an early-stage specification and toolkit. Expect rapid iteration.

Join the development or follow progress on GitHub: [github.com/acolby/proxyload](https://github.com/acolby/proxyload)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Load Utility

A utility function that creates a nested proxy structure for dynamically loading and executing code based on type and name hierarchies.

## Overview

The `load` function creates a two-level proxy system where:

- First level: **Type** (e.g., "component", "service", "util")
- Second level: **Name** (e.g., "Button", "AuthService", "formatDate")

## Usage

```typescript
import load from "./src/load";

const feds = load({
  host: "https://example.com",
  types: ["component", "service", "util"],
  loaders: {
    component: "componentLoader",
    service: "serviceLoader",
    util: "utilLoader",
  },
  globals: {
    // Global variables available to all loaded modules
  },
  references: {
    harness: "_PL_", // Global reference for the harness (default: '_PL_')
    items: "_PL_ITEMS_", // Global reference for loaders (default: '_PL_ITEMS_')
  },
  getVersion: ({ type, name, variation }) => {
    // Custom version resolution logic
    return "latest";
  },
});

// Usage examples:
feds.component.Button({ variation: "primary" });
feds.service.AuthService({ version: "1.2.0" });
feds.util.formatDate({ variation: "short" });
```

## Parameters

- `host`: Base URL for loading resources
- `types`: Array of supported type categories
- `loaders`: Mapping of types to their corresponding loader functions
- `globals`: Global variables to make available to loaded modules
- `references`: Optional custom global reference names
- `getVersion`: Function to resolve version for a given type/name/variation

## How It Works

1. Creates a nested proxy structure: `Feds[type][name]`
2. Each call resolves the appropriate loader based on type
3. Executes the loader with host, name, type, version, and variation parameters
4. Makes the proxy available globally via the harness reference

## Global References

The utility creates two global references:

- **Harness**: Contains the proxy structure and globals
- **Items**: Contains the loader functions for each type

These can be customized via the `references` parameter.
