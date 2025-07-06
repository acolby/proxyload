import React from "react";

export type Params = unknown;
export type Returns = React.ComponentType<unknown>;

export type Interface = (params: Params) => Returns;
