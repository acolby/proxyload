import React from "react";
import ReactDOM from "react-dom/client";

import Proxied from "./proxied";

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
