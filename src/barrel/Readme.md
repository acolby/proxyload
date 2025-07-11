# Barrel Utility

The barrel utility is responsible for injecting variable files and types throughout the code. Remember, these are only for convenience, at runtime a Proxy is what is actually consumed, so things are actually pulled in dynamically via loaders under the hood.

## Overview

The barrel utility automatically generates TypeScript files that create a type-safe, variation-aware interface for your proxied code structure. It scans your proxied directory and generates:

1. **Variation files** (`index.ts`) - Dynamic variation selectors for each component
2. **Type files** (`types.ts`) - TypeScript type definitions for each component
3. **Barrel files** (`index.ts`) - Export aggregators for each type category
4. **Top-level barrel** (`index.ts`) - Master export file for all types

## Usage

```typescript
import barrel from "@acolby/proxyload/barrel";

await barrel({
  dir: "./proxied", // Path to your proxied directory
  exclude: ["node_modules"], // Directories to exclude from processing
});
```

## Generated Files

### 1. Variation Files (`[TYPE]/[NAME]/index.ts`)

Creates a dynamic variation selector that allows runtime switching between different implementations:

```typescript
// Generated: proxied/Component/Button/index.ts
import type { Component_Button } from "./types";
import Button_default from "./default";
import Button_secondary from "./secondary";

type Variations = "default" | "secondary";

export const Button: Component_Button = (props) => {
  const { variation = "default" } = props;
  const variationMap = {
    default: Button_default,
    secondary: Button_secondary,
  };
  return (
    variationMap[variation || "default"]?.(props) ??
    variationMap["default"](props)
  );
};
```

### 2. Type Files (`[TYPE]/[NAME]/types.ts`)

Generates TypeScript type definitions that extend the interface with variation support:

```typescript
// Generated: proxied/Component/Button/types.ts
import type { Params, Returns } from "./interface";

type Variations = "default" | "secondary";

export type Component_Button = (
  props: Params & { variation?: Variations; version?: string }
) => Returns;
```

### 3. Barrel Files (`[TYPE]/index.ts`)

Creates export aggregators for each type category:

```typescript
// Generated: proxied/Component/index.ts
export { Button } from "./Button";
export { EmailForm } from "./EmailForm";

export const entries = [
  "/Button/default",
  "/Button/secondary",
  "/EmailForm/default",
] as const;
```

### 4. Top-Level Barrel (`index.ts`)

Master export file that barrels all types:

```typescript
// Generated: proxied/index.ts
export * as Component from "./Component";
export * as Loader from "./Loader";
```

## Directory Structure

The utility expects and generates files for this structure:

```
/proxied
  /[TYPE]                    # e.g., Component, Loader, Util
    /[NAME]                  # e.g., Button, EmailForm
      interface.ts           # Manual: Defines Params, Returns, Interface
      /[VARIATION]           # e.g., default, secondary
        index.ts(x)          # Manual: Implementation
      index.ts               # Generated: Variation selector
      types.ts               # Generated: Type definitions
    index.ts                 # Generated: Type barrel
  index.ts                   # Generated: Top-level barrel
```

## Integration with Build Process

Typically used in build scripts or development workflows:

```json
// package.json
{
  "scripts": {
    "barrel": "tsx ./scripts/barrel.ts",
    "build": "npm run barrel && npm run build:components"
  }
}
```

```typescript
// scripts/barrel.ts
import barrel from "@acolby/proxyload/barrel";

barrel({
  dir: `${__dirname}/../proxied`,
  exclude: ["node_modules", ".git"],
});
```

## Benefits

- **Type Safety**: Generated types ensure compile-time safety
- **Variation Support**: Built-in A/B testing capabilities
- **Auto-discovery**: Tools can automatically find and load components
- **Consistency**: Enforces the Proxyload directory convention
- **Developer Experience**: Reduces boilerplate and manual file creation

## Notes

- Generated files are marked with `// This file was generated by proxyload`
- Always run barrel after adding new components or variations
- The utility respects the `exclude` parameter to skip unwanted directories
- Generated files should not be manually edited as they will be overwritten
