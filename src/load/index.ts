export default function load<T>(params: {
  host: string;
  loaders: Record<string, string>;
  globals: Record<string, any>;
  getVersion: (params: {
    type: string;
    name: string;
    variation?: string;
  }) => string;
}) {
  const { host, loaders, getVersion, globals } = params;

  const globalitemsreference = "_PL_ITEMS_";

  // load globals
  for (const global in globals) {
    // @ts-ignore
    globalThis[global] = globals[global];
  }

  const ProxyLoaded = new Proxy(
    {},
    {
      get: (target, type) => {
        return new Proxy(
          {},
          {
            get: (target, name) => {
              const loader_key = loaders[type as string];
              // @ts-ignore
              const loader = globalThis[globalitemsreference][loader_key]();
              if (!loader) {
                console.error(`loader ${loader_key} found or loaded`);
              }

              return (params: { variation?: string; version?: string }) => {
                const variation = params.variation || "default";
                const version =
                  params.version ||
                  getVersion({
                    type: type as string,
                    name: name as string,
                    variation,
                  }) ||
                  "latest";

                return loader({
                  host,
                  name,
                  type,
                  version,
                  variation,
                })(params);
              };
            },
          }
        );
      },
    }
  );
  // @ts-ignore
  globalThis._PL_ = ProxyLoaded;
  return ProxyLoaded as T;
}
