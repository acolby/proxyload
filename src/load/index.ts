export default function load<T>(params: {
  host: string;
  loaders: Record<string, string>;
  globals: Record<string, any>;
  references?: {
    harness?: string;
    items?: string;
  };
  getVersion: (params: {
    type: string;
    name: string;
    variation?: string;
  }) => string;
}) {
  const { host, loaders, globals, references, getVersion } = params;

  const globalharnessreference = references?.harness || "_PL_";
  const globalitemsreference = references?.items || "_PL_ITEMS_";

  // @ts-ignore
  globalThis[globalharnessreference] = {
    ...globals,
  };
  // Feds is a nested proxy where the first level is the type and the second level is the name
  const Feds = new Proxy(
    {},
    {
      get: (target, type) => {
        return new Proxy(
          {},
          {
            get: (target, name) => {
              const loader_key = loaders[type as string];
              // @ts-ignore
              const loader = globalThis[globalitemsreference][loader_key];
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

                loader({
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
  for (const type in loaders) {
    // @ts-ignore
    globalThis[globalharnessreference][type] = Feds[type];
  }
  return Feds as T;
}
