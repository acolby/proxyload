import { Release } from "../types";

async function load(host: string, key: string): Promise<Release> {
  if (typeof window !== "undefined") {
    throw new Error("Preload is only available on the server");
  }

  const namespace = `_PL_`;

  // Initialize the global state if it doesn't exist
  if (!globalThis[namespace]) {
    globalThis[namespace] = {
      items: {},
      releases: {},
      current: "",
      namespace,
    };
  }

  // For now we fetch the server release information each load
  await loadModule(host, `releases/${key}/server`);

  // load everything in the manifest since we're on the server
  const hashes = globalThis[namespace].releases[key]?.hashes || {};

  await Promise.all(
    Object.entries(hashes).map(async ([key, hash]) => {
      // fetch all items that are in the hashes if they are not already loaded
      const itemKey = `${key}/${hash}`;
      if (!globalThis[namespace].items[itemKey]) {
        await loadModule(host, `items/${itemKey}`);
      }
    })
  );

  function loadModule(host: string, item: string): Promise<void> {
    return fetch(`${host}/${item}.js`, { cache: "no-store" })
      .then((res) => res.text())
      .then((text) => {
        // eslint-disable-next-line no-new-func
        new Function(text)();
      });
  }

  // set the current release
  globalThis[namespace].current = key;

  return globalThis[namespace].releases[key];
}

export default load;
