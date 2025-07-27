import type { Interface } from "../interface";
import React from "react";

const Loader: Interface = (params) => {
  return (props) => {
    const [loaded, setLoaded] = React.useState(false);

    const itemKey = `${params.type}/${params.name}/${params.variation}/${params.hash}`;

    React.useEffect(() => {
      // add script tag to head pointing to the host + /loader/component/default/latest.js
      const script = document.createElement("script");
      script.src = `${params.host}/items/${itemKey}.js`;
      document.head.appendChild(script);
      script.onload = () => {
        setLoaded(true);
      };
    }, []);

    // @ts-ignore
    if (globalThis?.[params.namespace]?.items?.[itemKey]) {
      // @ts-ignore
      const Comp = globalThis?.[params.namespace]?.items?.[itemKey](
        params.dependencies
      );
      return Comp(props);
    }

    return React.createElement("div", {
      children: "Loading!!!",
      style: {
        color: "green",
      },
    });
  };
};

export default Loader;
