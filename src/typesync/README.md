# TypeSync Utility

The TypeSync utility is a core component of the Proxyload toolkit that synchronizes type definitions from a running Proxyload server to your local development environment. It fetches consolidated type definitions from a server endpoint and writes them to your local filesystem, ensuring type safety across your development workflow.

## 🎯 Purpose

TypeSync solves the challenge of maintaining synchronized type definitions between your development environment and a running Proxyload server by:

- **Fetching Remote Types**: Retrieves the latest type definitions from a running server
- **Local Synchronization**: Writes type definitions to your local filesystem
- **Automatic Directory Creation**: Creates the necessary directory structure automatically
- **Development Workflow Integration**: Enables seamless type-safe development against proxied modules
- **Release-Aware**: Fetches type definitions from specific release keys for version control

## 📁 How It Works

TypeSync performs a simple but powerful synchronization process:

1. **HTTP Request**: Makes a GET request to the specified host's `/_releases/{key}/types.json` endpoint
2. **JSON Parsing**: Parses the response containing consolidated type definitions
3. **File System Operations**: Creates directories and writes files to match the server structure
4. **Local Type Safety**: Ensures your local environment has access to the latest types

### Input

TypeSync expects a JSON response from the server with the following structure:

```json
{
  "/Component/Button/interface.ts": "// TypeScript type definitions...",
  "/api/auth/interface.ts": "// TypeScript type definitions...",
  "/index.ts": "// Master type definition exports..."
}
```

### Output

The utility creates a local directory structure that mirrors the server's type organization:

```
dest/
├── Component/
│   └── Button/
│       └── interface.ts
├── api/
│   └── auth/
│       └── interface.ts
└── index.ts
```

## 🚀 Usage

```typescript
import typesync from "@acolby/proxyload/typesync";

await typesync({
  dest: "./src/proxied/types", // Local destination directory
  host: "http://localhost:3012", // Proxyload server URL
  key: "latest", // Release key for fetching specific type definitions
});
```

## 📋 API Reference

### `typesync(params: TypeSyncParams)`

Synchronizes type definitions from a Proxyload server to your local filesystem.

#### Parameters

- `dest` (string): Local directory path where type definitions will be written
- `host` (string): Base URL of the running Proxyload server
- `key` (string): Release key for fetching type definitions from `/_releases/{key}/types.json`

#### Returns

- `Promise<void>`: Resolves when synchronization is complete

## 🔧 Integration Examples

### Development Workflow

```typescript
// scripts/synctypes.ts
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import typesync from "@acolby/proxyload/typesync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await typesync({
  dest: resolve(__dirname, "../src/proxied/types"),
  host: "http://localhost:3012",
  key: "latest", // or "v1.0.0", "staging", etc.
});
```

### Package.json Script

```json
{
  "scripts": {
    "typesync": "tsx ./scripts/synctypes.ts",
    "typesync:staging": "tsx ./scripts/synctypes.ts --key=staging",
    "typesync:prod": "tsx ./scripts/synctypes.ts --key=v1.0.0"
  }
}
```

### Continuous Integration

```yaml
# .github/workflows/sync-types.yml
name: Sync Types
on:
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run typesync
      - name: Sync staging types
        run: npm run typesync:staging
```

## 🔗 Integration with Other Utilities

TypeSync works seamlessly with other Proxyload utilities:

- **TypeGen**: Provides the source `types.json` under `_releases/{key}/types.json` that TypeSync consumes
- **Build Utility**: Generates `manifest.json` under the same release key structure
- **Load Utility**: Ensures runtime-loaded modules have proper type definitions
- **Barrel Utility**: Generates type-safe interfaces from synchronized types

## 🚨 Error Handling

TypeSync includes basic error handling for common scenarios:

- **Network Errors**: Fails gracefully if the server is unreachable
- **JSON Parsing**: Validates the response format before processing
- **File System**: Creates directories recursively and handles write errors
- **Release Key**: Validates that the specified release key exists on the server

## 🔒 Security Considerations

- **HTTPS**: Use HTTPS URLs in production environments
- **Authentication**: Consider implementing authentication if your types contain sensitive information
- **Validation**: Validate the server response before writing to filesystem
- **Release Key Validation**: Ensure the release key corresponds to a valid, authorized release

## 📝 Best Practices

1. **Regular Synchronization**: Run TypeSync regularly during development to keep types current
2. **Version Control**: Consider whether synchronized types should be committed to version control
3. **Environment Configuration**: Use environment variables for host URLs and release keys in different environments
4. **Error Monitoring**: Monitor for synchronization failures in your development workflow
5. **Release Key Management**: Use consistent release keys across your development, staging, and production environments
6. **Type Versioning**: Coordinate release keys with your build and deployment pipeline

## 🔍 Troubleshooting

### Common Issues

- **Missing Release Key**: Ensure the specified release key exists on the server
- **Network Connectivity**: Verify the server is accessible and the endpoint is correct
- **File Permissions**: Check that the destination directory is writable
- **JSON Format**: Ensure the server returns valid JSON at the expected endpoint

### Debug Information

TypeSync provides console output showing the synchronization process:

```
Fetching types from http://localhost:3012/_releases/latest/types.json
Writing 15 type files to ./src/proxied/types
Synchronization complete
```

This helps you verify that the synchronization is working correctly and identify any issues.
