import React from "react";
import proxy from "../../../../src/proxy";

import JSX from "react/jsx-runtime";

import { Proxied } from "./types/index";

const ProxiedLoaded = proxy<Proxied>({
  host: "http://localhost:3012",
  dependencies: {
    "react/jsx-runtime": JSX,
    react: React,
  },
  namespace: "_VITE_PROXIED_",
  proxyImport: "@proxied",
});

export default ProxiedLoaded;
