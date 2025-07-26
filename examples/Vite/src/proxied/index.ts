import React from "react";
import proxy from "../../../../src/proxy";

import JSX from "react/jsx-runtime";

import { Proxied } from "./types/index";

const ProxiedLoaded = proxy<Proxied>({
  host: "http://localhost:3012",
  globals: {
    JSX: JSX,
    React: React,
  },
});

export default ProxiedLoaded;
