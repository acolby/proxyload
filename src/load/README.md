# Load Utility

Server-side utility for loading release manifests and preloading all associated modules. Must be called before using the `proxy` utility on the server.

## Usage

```typescript
import load from "@acolby/proxyload/load";

// Load release and all its modules
const release = await load("https://example.com", "latest");
```

## API

### `load(host: string, key: string): Promise<Release>`

- **host**: Base URL of Proxyload server
- **key**: Release key (e.g., "latest", "v1.0.0")
- **Returns**: Release object with manifest data

## How It Works

1. Validates server-side execution
2. Initializes global `_PL_` namespace if needed
3. Loads release manifest from `${host}/releases/${key}/server.js`
4. Preloads all modules in the manifest that aren't already cached
5. Sets the release as current active

## Integration

```typescript
// 1. Load release first
await load("https://example.com", "latest");

// 2. Then use proxy utility
const proxied = proxy({
  host: "https://example.com",
  globals: { React: require("react") },
});
```

## Error Handling

- Throws if called in browser environment
- Network failures should be wrapped in try-catch
- Missing modules will be logged but won't fail the load

## Global State

Initializes `globalThis._PL_` with:

```typescript
{
  items: {}, // Loaded modules cache
  releases: {}, // Release manifests
  current: "", // Current active release key
  proxy: null, // Proxy object (set by proxy utility)
}
```
