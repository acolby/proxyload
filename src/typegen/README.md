# TypeGen Utility

The TypeGen utility is a core component of the Proxyload toolkit that automatically generates consolidated type definitions from your proxied code structure. It scans your proxied directory, extracts interface and type definitions, and creates a unified `types.json` file that can be consumed by target applications.

## 🎯 Purpose

TypeGen solves the challenge of maintaining consistent type definitions across a modular, proxied codebase by:

- **Consolidating Types**: Merges all interface and type files into a single consumable object
- **Maintaining Structure**: Preserves the hierarchical structure of your proxied code
- **Enabling Type Safety**: Provides type definitions for runtime-loaded modules
- **Reducing Boilerplate**: Automatically generates type exports and imports

## 📁 How It Works

TypeGen processes your proxied directory structure and generates two main outputs:

1. **Individual Type Files**: Each proxied item gets its types consolidated into a single file
2. **Rolled-up Index**: A master type definition that exports all types in a structured object

### Input Structure

TypeGen expects your proxied directory to follow the standard Proxyload structure:

```
/proxied
  /[TYPE]
    /[NAME]
      interface.ts    # Extracted and processed
      types.ts        # Extracted and processed
      /[VARIATION]
        index.ts(x)
```

### Output Structure

The utility generates a `types.json` file containing:

```json
{
  "/Component/Button/types.ts": "// Consolidated types for Button component",
  "/Component/Header/types.ts": "// Consolidated types for Header component",
  "/api/auth/types.ts": "// Consolidated types for auth API",
  "/index.ts": "// Master type definition with all exports"
}
```

## 🚀 Usage

```typescript
import typegen from "@acolby/proxyload/typegen";

await typegen({
  dir: "./proxied", // Source directory containing proxied code
  dist: "./dist", // Output directory for types.json
});
```

## 📋 API Reference

### `typegen(params: TypeGenParams)`

Generates consolidated type definitions from your proxied code structure.

#### Parameters

- `dir` (string): Path to the directory containing your proxied code structure
- `dist` (string): Path to the output directory where `types.json` will be written

#### Returns

- `Promise<void>`: Resolves when type generation is complete

## 🔧 How It Processes Files

### Interface Processing

TypeGen reads each `interface.ts` file and includes it in the consolidated types:

```typescript
// Original: /proxied/Component/Button/interface.ts
export type Params = { label: string; onClick?: () => void };
export type Returns = JSX.Element;
export type Interface = (params: Params) => Returns;

// Becomes part of: /Component/Button/types.ts
// derived from interface files
export type Params = { label: string; onClick?: () => void };
export type Returns = JSX.Element;
export type Interface = (params: Params) => Returns;
```

### Types Processing

TypeGen reads each `types.ts` file and strips import statements to avoid conflicts:

```typescript
// Original: /proxied/Component/Button/types.ts
import type { SomeType } from "some-package";
export type ButtonProps = {
  /* ... */
};

// Becomes part of: /Component/Button/types.ts
// replace the whole import line with and empty string
export type ButtonProps = {
  /* ... */
};
```

### Index Generation

TypeGen creates a master index file that exports all types in a structured object:

```typescript
import type { Component_Button } from "./Component/Button/types.ts";
import type { Component_Header } from "./Component/Header/types.ts";

export type ProxiedTypes = {
  Component: {
    Button: Component_Button;
    Header: Component_Header;
  };
  api: {
    auth: api_auth;
  };
};
```

## 🔗 Integration with Other Utilities

TypeGen works seamlessly with other Proxyload utilities:

- **Build Utility**: Uses generated types for type-safe builds
- **Load Utility**: Consumes type definitions for runtime type checking
- **Barrel Utility**: Can use consolidated types for generating barrel exports

## 📝 Example Output

After running TypeGen on a proxied directory, you'll get a `types.json` file that can be consumed by your applications:

```json
{
  "/Component/Button/types.ts": "// derived from interface files\nexport type Params = { label: string; onClick?: () => void; };\nexport type Returns = JSX.Element;\nexport type Interface = (params: Params) => Returns;\n\nexport type ButtonProps = { /* ... */ };",
  "/api/auth/types.ts": "// derived from interface files\nexport type AuthParams = { /* ... */ };\nexport type AuthReturns = { /* ... */ };\nexport type AuthInterface = (params: AuthParams) => AuthReturns;\n\nexport type AuthConfig = { /* ... */ };",
  "/index.ts": "import type { Component_Button } from \"./Component/Button/types.ts\";\nimport type { api_auth } from \"./api/auth/types.ts\";\n\nexport type ProxiedTypes = {\n  Component: {\n    Button: Component_Button;\n  },\n  api: {\n    auth: api_auth;\n  },\n};"
}
```

## 🎯 Best Practices

1. **Keep Interfaces Clean**: Ensure your `interface.ts` files only contain the essential type definitions
2. **Avoid Circular Dependencies**: Be mindful of import statements in your `types.ts` files
3. **Consistent Naming**: Use consistent naming conventions across your proxied structure
4. **Regular Regeneration**: Run TypeGen whenever you add new proxied items or modify interfaces

## 🔍 Troubleshooting

### Common Issues

- **Missing Files**: Ensure all proxied items have both `interface.ts` and `types.ts` files
- **Import Conflicts**: TypeGen automatically strips import statements, but ensure your types don't have circular dependencies
- **Directory Structure**: Verify your proxied directory follows the standard Proxyload structure

### Debug Output

TypeGen provides console output showing which files it's processing:

```
Component Button
Component Header
api auth
```

This helps you verify that all expected items are being processed correctly.
