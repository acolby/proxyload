
  import type { Params, Returns } from "./interface";

  type Variations = "default";

  export type Component_EmailForm = (
    props: Params & { variation?: Variations; version?: string }
  ) => Returns;
  