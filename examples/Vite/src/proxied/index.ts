import React from "react";
import load from "../../../../src/load";

import JSX from "react/jsx-runtime";

import { ProxiedTypes } from "./types/index";

const Proxied = load<ProxiedTypes>({
  host: "http://localhost:3012",
  loaders: {
    Component: "Loader/Component/default/latest",
  },
  globals: {
    JSX: JSX,
    React: React,
  },
  getVersion: () => "latest",
});

// @ts-ignore
globalThis["_PROXIED_"] = Proxied;

export default Proxied;
