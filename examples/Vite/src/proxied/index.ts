import React from "react";
import load from "../../../../src/load";

import JSX from "react/jsx-runtime";

import { Proxied } from "./types/index";

const ProxiedLoaded = load<Proxied>({
  host: "http://localhost:3012",
  key: "latest",
  globals: {
    JSX: JSX,
    React: React,
  },
});

// @ts-ignore
globalThis["_PROXIED_"] = ProxiedLoaded;

export default ProxiedLoaded;
