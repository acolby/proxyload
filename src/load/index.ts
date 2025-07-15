export default function load<T>(params: {
  host: string;
  loaders: Record<string, string>;
  globals: Record<string, any>;
  getVersion: (params: {
    type: string;
    name: string;
    variation?: string;
  }) => string;
  namespace?: string;
}) {
  const { host, loaders, getVersion, globals } = params;
  const namespace = params.namespace || "_PL_";
  const globalitemsreference = "_PL_ITEMS_";
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
              const loader_key = loaders[type];
              // @ts-ignore
              const loader = globalThis[globalitemsreference][loader_key];
              if (!loader) {
                // @ts-ignore
                console.error(`loader ${loader_key} found or loaded`);
              }

              if (!memoized[_id] || typeof window === "undefined") {
                memoized[_id] = (props: Record<string, any>) => {
                  const variation = props.variation || "default";
                  const version =
                    props.version ||
                    getVersion({
                      type: type,
                      name: name,
                      variation,
                    }) ||
                    "latest";

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
