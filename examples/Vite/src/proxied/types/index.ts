
import type { Component_Button } from "./Component/Button/types.ts";
import type { Component_EmailForm } from "./Component/EmailForm/types.ts";
import type { Loader_Component } from "./Loader/Component/types.ts";

export type ProxiedTypes = {
  Component: {
    Button: Component_Button;
    EmailForm: Component_EmailForm;
  },
  Loader: {
    Component: Loader_Component;
  },
};
