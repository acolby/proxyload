import type { Interface } from "../interface";

const Loader: Interface = (params) => {
  return (props) => {
    const React = globalThis.React;

    const [loaded, setLoaded] = React.useState(false);

    const itemKey = `${params.type}/${params.name}/${params.variation}/${params.version}`;

    React.useEffect(() => {
      // add script tag to head pointing to the host + /loader/component/default/latest.js
      const script = document.createElement("script");
      script.src = `${params.host}/${itemKey}.js`;
      document.head.appendChild(script);
      script.onload = () => {
        setLoaded(true);
      };
    }, []);

    // @ts-ignore
    if (globalThis._PL_ITEMS_[itemKey]) {
      // @ts-ignore
      const Comp = globalThis._PL_ITEMS_[itemKey]();
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
