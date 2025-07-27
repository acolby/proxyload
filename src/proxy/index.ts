import { LoaderParams, ProxyParams, Release } from "../types";

export default function proxy<T>(params: ProxyParams<T>) {
  const { host, proxyImport = "@proxied" } = params;

  const namespace = params.namespace;

  // injected dependencies
  const dependencies = {
    ...params.dependencies,
    // this is the proxy reference
    [`${proxyImport}`]: {},
  };

  const memoized: Record<string, unknown> = {};
  const ProxyLoaded = new Proxy(
    {},
    {
      get: (target, type: string) => {
        return new Proxy(
          {},
          {
            get: (target, name: string) => {
              // @ts-ignore
              const release_key = globalThis[namespace]?.current;
              const release = getRelease(release_key);

              const loader_key = release.loaders?.[type];
              const loader_factory = (globalThis as any)[namespace].items[
                loader_key
              ];

              if (!loader_factory) {
                console.error(`loader ${loader_key} not found or loaded`);
              }

              const _id = `${release.id}/${type}/${name}`;

              if (!memoized[_id] || typeof window === "undefined") {
                memoized[_id] = (props: Record<string, any>) => {
                  const variation = props.variation || "default";
                  const hash = release.hashes[`${type}/${name}/${variation}`];

                  const loader = loader_factory(dependencies) as (
                    params: LoaderParams
                  ) => any;

                  // Try to get version from props first, then hashes, then fallback to "latest"
                  return ((props) => {
                    return loader({
                      host,
                      name,
                      type,
                      hash,
                      variation,
                      namespace: namespace,
                      dependencies,
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

  function getRelease(release_key: string): Release {
    // @ts-ignore
    const release = globalThis?.[namespace]?.releases?.[release_key];

    if (!release) {
      throw new Error(
        `The proxyloaded release has not been loaded. Please load the release first. by adding a <script src="${host}/releases/${release_key}/client.js"></script> to your page.

On the CLIENT the following script must be loaded ahead of the Proxyload script:
<script src="${host}/releases/${release_key}/client.js"></script>

On the SERVER the following script must be loaded ahead of the Proxyload script:
"${host}/releases/${release_key}/server.js"

The server script must be loaded before the Proxyload script.
`
      );
    }

    return release;
  }

  dependencies[proxyImport] = ProxyLoaded;
  return ProxyLoaded as T;
}
