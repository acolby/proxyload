# @acolby/proxyload

**Proxyload** is a structural standard and toolkit for organizing, typing, versioning, and deploying modular TypeScript code at scale.

This standard flips the paradigm of how large projects are managed by simplifying and standardizing build-time artifacts, while allowing for customizable runtime loaders.

## 📁 Using Proxyload

Once a project is Proxyloaded, code is consumed via a recursive proxy object as follows:

```tsx
// src/Component/Landing/default/index.tsx
import { Component } from '@proxyloaded';

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
- Extremely fast builds (no fancy bundling, every item acts as its own entrypoint)
- Injectable middleware for various code types

## ⚙️ How it Works

It starts with conventions. This repository provides tools for maintaining Proxyloadable code.

### 📁 Directory Convention

The ProxyLoad standard enforces a clear 4-level structure inside your `[proxied]/` folder:

```
/proxied                 # you can specified this whereever you'd like
  /[TYPE]                # High-level category (e.g. 'api', 'Component', 'task')
    /[NAME]              # Specific item within the category (e.g. 'checkout', 'logger')
      interface.ts       # Defines Params, Returns, and Interface
      /[VARIATION]       # Optional: One or more variations for experimentation
        index.ts(x)      # Each variation must include an index file
```

> 🧠 **Example:**
>
> ```
> /proxied
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

Each build artifact is automatically assigned to the global namespace by the build utility. The build process creates a structured global object that organizes all your proxied code for runtime loading.

By default, the variation is `default` and the version is `latest`.

### 📦 Release Management

Proxyload organizes build artifacts and type definitions under release keys for version control and deployment management:

```
dist/
├── [TYPE]/
│   └── [NAME]/
│       └── [VARIATION]/
│           └── [VERSION].js
└── _releases/
    └── [KEY]/
        ├── manifest.json    # Version mapping for build artifacts
        └── types.json       # Consolidated type definitions
```

The release key system enables:

- **Version Control**: Organize builds and types under meaningful release keys (e.g., "latest", "v1.0.0", "staging")
- **Deployment Management**: Deploy specific releases independently
- **Type Safety**: Ensure type definitions match the deployed code versions
- **Rollback Capability**: Quickly switch between different releases

You can load any item dynamically using the `@acolby/proxyload/load` function. See `src/load/README.md`.

**Note:** You are responsible for implementing custom loaders per `[TYPE]`.

---

## ✅ Core Principles

- **Encapsulation**: Each component is self-contained with types and logic.
- **Contract-Driven**: Type-safe interfaces ensure correctness.
- **Variation-Ready**: Built-in support for A/B testing.
- **Versioned**: All variations follow `[TYPE]/[NAME]/[VARIATION]/[VERSION].js`.
- **Tooling-Oriented**: Auto-discoverable by ProxyLoad-compatible tools.
- **Runtime-Interop**: Swappable at runtime if the contract is upheld.

---

# Examples

## Decoupled Proxy Object

The `proxied/` directory in this project demonstrates how to create a decoupled proxy object following the Proxyload standard. This example shows the complete structure for a modular component system:

```
proxied/src/
├── Component/
│   ├── Button/
│   │   ├── interface.ts          # Defines the component contract
│   │   ├── default/
│   │   │   └── index.tsx         # Default implementation
│   │   └── secondary/
│   │       └── index.tsx         # Alternative variation
│   └── EmailForm/
│       ├── interface.ts
│       └── default/
│           └── index.tsx
└── Loader/
    └── Component/
        └── default/
            └── index.ts          # Custom loader for Component type
```

## Host Application Integration

The `examples/Vite/` directory demonstrates how a host application integrates the proxy object at runtime. This example shows a React application that dynamically loads components from the proxied structure:

### Proxy Configuration

```tsx
// examples/Vite/src/proxied/index.ts
import React from "react";
import load from "@acolby/proxyload/load";
import JSX from "react/jsx-runtime";
import { ProxiedTypes } from "./types/index";

const Proxied = load<ProxiedTypes>({
  host: "http://localhost:3012",
  globals: {
    JSX: JSX,
    React: React,
  },
});

export default Proxied;
```

### Runtime Usage

```tsx
// examples/Vite/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import Proxied from "./proxied";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    // This code is pulled in at runtime per the implementation of the loader
    <Proxied.Component.Button
      text="Click me"
      onClick={() => {
        console.log("clicked");
      }}
    />
  </React.StrictMode>
);
```

This demonstrates how the host application can seamlessly use proxied components as if they were locally imported, while the actual implementation is loaded dynamically at runtime.

---

# Utilities

## Load Utility

For detailed documentation on the load utility, see [src/load/README.md](src/load/README.md).

The load utility creates a nested proxy structure for dynamically loading and executing code based on type and name hierarchies. It's the core mechanism that enables Proxyload's runtime code loading capabilities.

## Build Utility

For detailed documentation on the build utility, see [src/build/README.md](src/build/README.md).

The build utility compiles your proxied code structure into individual JavaScript files that can be dynamically loaded at runtime. It uses esbuild under the hood and supports custom plugins and configuration options.

## TypeGen Utility

For detailed documentation on the typegen utility, see [src/typegen/README.md](src/typegen/README.md).

The TypeGen utility automatically generates consolidated type definitions from your proxied code structure. It scans your proxied directory, extracts interface and type definitions, and creates a unified `types.json` file organized under release keys. This ensures type safety across your modular, runtime-loaded codebase and enables version-controlled type management.

## TypeSync Utility

For detailed documentation on the typesync utility, see [src/typesync/README.md](src/typesync/README.md).

The TypeSync utility synchronizes type definitions from a running Proxyload server to your local development environment. It fetches the consolidated `types.json` from a server's `/_releases/{key}/types.json` endpoint and writes the type definitions to your local filesystem, ensuring your development environment has access to the latest type definitions from your proxied code structure with release-aware versioning.

## Barrel Utility

For detailed documentation on the barrel utility, see [src/barrel/Readme.md](src/barrel/Readme.md).

The barrel utility automatically generates TypeScript files that create type-safe, variation-aware interfaces for your proxied code structure. It scans your proxied directory and generates variation selectors, type definitions, and barrel export files to maintain consistency and reduce boilerplate.

## 🚧 Status

This is an early-stage specification and toolkit. Expect rapid iteration.

Join the development or follow progress on GitHub: [github.com/acolby/proxyload](https://github.com/acolby/proxyload)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
