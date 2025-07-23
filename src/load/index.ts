export default async function load<T>(params: {
  host: string;
  key: string;
  globals: Record<string, any>;
  namespace?: string;
}) {
  const { host, globals } = params;

  const namespace = params.namespace || "_PL_";

  // load the manifest
  const manifest = await (
    await fetch(`${host}/_releases/${params.key}/manifest.json`)
  ).json();

  console.log(manifest);

  // load globals
  for (const global in globals) {
    // @ts-ignore
    globalThis[global] = globals[global];
  }

  const memoized: Record<string, unknown> = {};
  const ProxyLoaded = new Proxy(
    {},
    {
      get: (target, type: string) => {
        return new Proxy(
          {},
          {
            get: (target, name: string) => {
              const _id = `${type}/${name}`;
              // @ts-ignore
              const releaseLoaders = (globalThis as any)[namespace]?.releases?.[
                params.key
              ]?.loaders;
              const loader_key = releaseLoaders?.[type];
              // @ts-ignore
              const loader = (globalThis as any)[namespace].items[loader_key];
              if (!loader) {
                // @ts-ignore
                console.error(`loader ${loader_key} not found or loaded`);
              }

              if (!memoized[_id] || typeof window === "undefined") {
                memoized[_id] = (props: Record<string, any>) => {
                  const variation = props.variation || "default";

                  // Try to get version from props first, then manifest, then fallback to "latest"
                  let version = props.version;

                  if (
                    !version &&
                    (globalThis as any)[namespace]?.releases?.[params.key]
                      ?.manifest
                  ) {
                    const manifest = (globalThis as any)[namespace].releases[
                      params.key
                    ].manifest;
                    const manifestKey = `${type}/${name}`;
                    version = manifest[manifestKey];
                  }

                  if (!version) {
                    version = "latest";
                  }

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
  globalThis[namespace] = ProxyLoaded;
  return ProxyLoaded as T;
}
