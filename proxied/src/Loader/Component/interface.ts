import type React from "react";

export type Params = {
  host: string;
  name: string;
  type: string;
  version: string;
  variation: string;
};
export type Returns = React.ComponentType<unknown>;

export type Interface = (params: Params) => Returns;
