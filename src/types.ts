import type { Plugin, BuildOptions } from "esbuild";

export type Release = {
  id: string;
  hashes: Record<string, string>;
  loaders: Record<string, string>;
  dependencies: Record<string, { version?: string }>;
  createdAt?: string;
  updatedAt?: string;
};

export type Items = Record<string, string>;

export type ProxyState = {
  releases: Record<string, Release>;
  items: Items;
  current: string;
  namespace: string;
};

// Global declaration for TypeScript
declare global {
  var _PL_: ProxyState;
}

// Additional types for utility functions
export type BuildParams = {
  dir: string;
  dist: string;
  dependencies: Record<string, { version?: string }>;
  proxyRef: string;
  // the internal global reference to the proxy for example "@proxied"
  key: string;
  loaders: Record<string, string>;
  plugins?: Plugin[];
  esbuildOptions?: BuildOptions;
  minify?: boolean;
};

export type TypegenParams = {
  dir: string;
  dist: string;
  key: string;
};

export type TypesyncParams = {
  dest: string;
  host: string;
  key: string;
};

export type ProxyParams<T = any> = {
  host: string;
  dependencies: Record<string, any>;
  proxyImport?: string;
};

export type BarrelParams = {
  exclude: string[];
  dir: string;
};

export type LoadReleaseParams = {
  host: string;
  key: string;
};

export type InterfaceFile = {
  name: string;
  variations: string[];
};

export type TypeGroup = {
  name: string;
  items: InterfaceFile[];
};

export type ReleasesData = {
  releases: Record<string, { createdAt: string; updatedAt: string }>;
};

export type Target = {
  name: string;
  environments: string[];
};

export type TargetsFile = {
  [targetName: string]: Target;
};

export type LoaderParams = {
  host: string;
  name: string;
  type: string;
  hash: string;
  variation: string;
  namespace: string;
  dependencies: Record<string, any>;
};
