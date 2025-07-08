import React from "react";
import ReactDOM from "react-dom/client";
import load from "../../../src/load";

import JSX from "react/jsx-runtime";

// TODO: inject proxied types
const Proxied = load({
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Proxied.Component.Button
      text="Click me"
      onClick={() => {
        console.log("clicked");
      }}
    />
  </React.StrictMode>
);
