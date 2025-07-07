
  import type { Params, Returns } from "./interface";

  type Variations = "default";

  export type Component_Component = (
    props: Params & { variation?: Variations; version?: string }
  ) => Returns;
  