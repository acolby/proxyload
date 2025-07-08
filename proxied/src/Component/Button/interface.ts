import type React from "react";

export type Params = {
  text: string;
  onClick: () => void;
};

export type Returns = React.JSX.Element;

export type Interface = (params: Params) => Returns;
