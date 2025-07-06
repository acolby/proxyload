
import type { Params as Params_Component, Returns as Returns_Component } from "./Component/interface";

type Component_variations = "default";

export type types = {
  Component: (props: Params_Component & { variation?: Component_variations; version?: string; }) => Returns_Component;
};

export const items = [
  "Component",
] as const;

export const entries = [
  '/Component/default',
] as const;
