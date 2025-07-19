import { Interface as Component_Button } from "./Component/Button/interface.ts";
import { Interface as Component_EmailForm } from "./Component/EmailForm/interface.ts";
import { Interface as Loader_Component } from "./Loader/Component/interface.ts";

type Component = {
  Button: Component_Button;
  EmailForm: Component_EmailForm;
};
type Loader = {
  Component: Loader_Component;
};

export type Proxied = {
  Component: Component;
  Loader: Loader;
};