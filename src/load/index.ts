export default function load<T>(params: {
  host: string;
  key: string;
  globals: Record<string, any>;
  namespace?: string;
}) {
  const { host, globals } = params;

  const namespace = params.namespace || "_PL_";

  // load globals
  for (const global in globals) {
    // @ts-ignore
    globalThis[global] = globals[global];
  }

  // load release ->
  const release_key = params.key;
  const release = (globalThis as any)[namespace]?.releases?.[release_key];
  const manifest: Record<string, string> = release?.manifest || {};
  const loaders: Record<string, string> = release?.loaders || {};

  const memoized: Record<string, unknown> = {};
  const ProxyLoaded = new Proxy(
    {},
    {
      get: (target, type: string) => {
        return new Proxy(
          {},
          {
            get: (target, name: string) => {
              const loader_key = loaders?.[type];
              const loader = (globalThis as any)[namespace].items[loader_key];

              if (!loader) {
                // @ts-ignore
                console.error(`loader ${loader_key} not found or loaded`);
              }

              const _id = `${release_key}/${type}/${name}`;

              if (!memoized[_id] || typeof window === "undefined") {
                memoized[_id] = (props: Record<string, any>) => {
                  const variation = props.variation || "default";
                  const version = manifest[`${type}/${name}/${variation}`];

                  // Try to get version from props first, then manifest, then fallback to "latest"
                  return ((props) => {
                    return loader({
                      host,
                      name,
                      type,
                      version,
                      variation,
                    })(props);
                  })(props);
                };
              }

              return memoized[_id];
            },
          }
        );
      },
    }
  );
  // @ts-ignore
  return ProxyLoaded as T;
}
