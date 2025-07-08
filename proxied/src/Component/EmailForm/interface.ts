import type React from "react";

export type Params = {
  onSubmit: (val: string) => void;
};

export type Returns = React.JSX.Element;

export type Interface = (params: Params) => Returns;
