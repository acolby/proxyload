import type { Params, Returns } from "./interface";

import Button_default from "./default";
import Button_secondary from "./secondary";

type Variations = "default" | "secondary";

export type FullInterface = (
  props: Params & { variation?: Variations; version?: string }
) => Returns;

export const Button: FullInterface = (props) => {
  const { variation = "default" } = props;
  return {
    default: Button_default,
    secondary: Button_secondary,
  }[variation || "default"](props);
};
