# TypeGen Utility

The TypeGen utility is a core component of the Proxyload toolkit that exposes all interface files from your proxied code structure as a JSON object. It scans your proxied directory and creates a unified `types.json` file that can be consumed by target applications.

## 🎯 Purpose

TypeGen provides a simple way to access all interface definitions from your proxied codebase by:

- **Exposing Interfaces**: Makes all interface files available as a JSON object
- **Maintaining Structure**: Preserves the hierarchical structure of your proxied code
- **Enabling Type Safety**: Provides type definitions for runtime-loaded modules
- **Simple Consumption**: Offers a straightforward way to access all interface definitions
- **Release Management**: Organizes type definitions under release keys for version control

## 📁 How It Works

TypeGen processes your proxied directory structure and generates a single output:

1. **Interface Files Collection**: All interface files are collected and exposed as a JSON object
2. **Release Organization**: Type definitions are organized under release keys for version management

### Input Structure

TypeGen expects your proxied directory to follow the standard Proxyload structure:

```
/proxied
  /[TYPE]
    /[NAME]
      interface.ts    # Enhanced with variation types by barrel utility
      /[VARIATION]
        index.ts(x)
```

### Output Structure

The utility generates a `types.json` file under a release key directory containing all interface files:

```
dist/
└── _releases/
    └── [KEY]/
        └── types.json
```

The `types.json` file contains all interface files:

```json
{
  "/Component/Button/interface.ts": "// Enhanced interface for Button component",
  "/Component/Header/interface.ts": "// Enhanced interface for Header component",
  "/api/auth/interface.ts": "// Enhanced interface for auth API",
  "index.ts": "// Barrel index with consolidated exports"
}
```

## 🚀 Usage

```typescript
import typegen from "@acolby/proxyload/typegen";

await typegen({
  dir: "./proxied", // Source directory containing proxied code
  dist: "./dist", // Output directory for types.json
  key: "latest", // Release key for organizing type definitions
});
```

## 📋 API Reference

### `typegen(params: TypeGenParams)`

Exposes all interface files as a JSON object from your proxied code structure.

#### Parameters

- `dir` (string): Path to the directory containing your proxied code structure
- `dist` (string): Path to the output directory where `types.json` will be written
- `key` (string): Release key for organizing type definitions under `_releases/{key}/types.json`

#### Returns

- `Promise<void>`: Resolves when type generation is complete

## 🔧 How It Processes Files

### Interface Collection

TypeGen reads each `interface.ts` file and includes it in the JSON output:

```typescript
// Original: /proxied/Component/Button/interface.ts
import type React from "react";

export type Params = {
  text: string;
  onClick: () => void;
};

export type Returns = React.JSX.Element;

// Generated by proxyload
export type Variations = "default" | "secondary";

export type Interface = (
  props: Params & { variation?: Variations; version?: string }
) => Returns;

// Becomes part of: _releases/{key}/types.json
"/Component/Button/interface.ts": "import type React from \"react\";\n\nexport type Params = {\n  text: string;\n  onClick: () => void;\n};\n\nexport type Returns = React.JSX.Element;\n\n// Generated by proxyload\nexport type Variations = \"default\" | \"secondary\";\n\nexport type Interface = (\n  props: Params & { variation?: Variations; version?: string }\n) => Returns;\n"
```

### Barrel Index Generation

TypeGen also generates a barrel index file that consolidates all type exports:

```typescript
// Generated: index.ts in types.json
export * from "./Component/Button/interface";
export * from "./Component/Header/interface";
export * from "./api/auth/interface";
```

## 🔗 Integration with Other Utilities

TypeGen works seamlessly with other Proxyload utilities:

- **Barrel Utility**: Enhances interface files with variation types before TypeGen processes them
- **Build Utility**: Uses exposed interface definitions for type-safe builds and generates manifest.json under the same release key
- **Proxy Utility**: Consumes interface definitions for runtime type checking
- **TypeSync Utility**: Fetches type definitions from `_releases/{key}/types.json` endpoints

## 📝 Example Output

After running TypeGen on a proxied directory, you'll get a `types.json` file organized under a release key that can be consumed by your applications:

```
dist/
└── _releases/
    └── latest/
        └── types.json
```

The `types.json` file contains:

```json
{
  "/Component/Button/interface.ts": "import type React from \"react\";\n\nexport type Params = {\n  text: string;\n  onClick: () => void;\n};\n\nexport type Returns = React.JSX.Element;\n\n// Generated by proxyload\nexport type Variations = \"default\" | \"secondary\";\n\nexport type Interface = (\n  props: Params & { variation?: Variations; version?: string }\n) => Returns;\n",
  "/Component/EmailForm/interface.ts": "import type React from \"react\";\n\nexport type Params = {\n  onSubmit: (val: string) => void;\n};\n\nexport type Returns = React.JSX.Element;\n\n// Generated by proxyload\nexport type Variations = \"default\";\n\nexport type Interface = (\n  props: Params & { variation?: Variations; version?: string }\n) => Returns;\n",
  "index.ts": "export * from \"./Component/Button/interface\";\nexport * from \"./Component/EmailForm/interface\";"
}
```

## 🎯 Best Practices

1. **Keep Interfaces Clean**: Ensure your `interface.ts` files contain clear, well-defined type definitions
2. **Use Barrel Utility**: Let the barrel utility enhance your interface files with variation types
3. **Consistent Naming**: Use consistent naming conventions across your proxied structure
4. **Regular Regeneration**: Run TypeGen whenever you add new proxied items or modify interfaces
5. **Release Key Management**: Use meaningful release keys (e.g., "latest", "v1.0.0", "staging") for organizing type definitions

## 🔍 Troubleshooting

### Common Issues

- **Missing Interface Files**: Ensure all proxied items have `interface.ts` files
- **Directory Structure**: Verify your proxied directory follows the standard Proxyload structure
- **Barrel Enhancement**: Make sure the barrel utility runs before TypeGen to enhance interface files
- **Release Key**: Ensure the release key is consistent across your build pipeline

### Debug Output

TypeGen provides console output showing which files it's processing:

```
barrel...
typegen...
build...
```

This helps you verify that all expected items are being processed correctly.
