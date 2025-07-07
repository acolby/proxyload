import React from "react";
import type { Interface } from "../interface";

const Loader: Interface = () => {
  return () =>
    React.createElement("div", {
      children: "Loading...",
    });
};

export default Loader;
