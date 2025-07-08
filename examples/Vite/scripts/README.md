# Scripts

This directory contains utility scripts for the Vite example project.

## synctypes.ts

A TypeScript script that synchronizes type definitions from a Proxyload server to the local development environment.

### Purpose

The `synctypes.ts` script fetches consolidated type definitions from a running Proxyload server and writes them to the local `src/proxied/types` directory. This ensures that your local development environment has access to the latest type definitions from your proxied code structure.

### Usage

```bash
# Run the script directly
npx tsx ./scripts/synctypes.ts

# Or use the npm script
npm run typesync
```

### Configuration

The script is configured to:

- **Source**: Fetch types from `http://localhost:3012/types.json`
- **Destination**: Write files to `../src/proxied/types` (relative to the scripts directory)

### How It Works

1. **Fetches Types**: Makes a GET request to the specified host's `/types.json` endpoint
2. **Processes Response**: Parses the JSON response containing consolidated type definitions
3. **Creates Directory Structure**: Automatically creates the necessary directory structure
4. **Writes Files**: Writes each type definition to its corresponding file path

### Prerequisites

- A Proxyload server must be running on `http://localhost:3012`
- The server must have generated types available at `/types.json`
- The `tsx` package must be installed for TypeScript execution

### Integration

This script is typically used in development workflows where you need to:

- Keep local type definitions in sync with a running Proxyload server
- Ensure type safety when developing against proxied modules
- Automate the type synchronization process

### Example Output

After running the script, you'll have a directory structure like:

```
src/proxied/types/
├── Component/
│   └── Button/
│       └── types.ts
├── api/
│   └── auth/
│       └── types.ts
└── index.ts
```

Each file contains the consolidated type definitions for that specific proxied module.
