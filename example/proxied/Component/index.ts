
import type { Params as Params_Button, Returns as Returns_Button } from "./Button/interface";
import type { Params as Params_EmailForm, Returns as Returns_EmailForm } from "./EmailForm/interface";

type Button_variations = "default" | "secondary";
type EmailForm_variations = "default";

export type types = {
  Button: (props: Params_Button & { variation?: Button_variations; version?: string; }) => Returns_Button;
  EmailForm: (props: Params_EmailForm & { variation?: EmailForm_variations; version?: string; }) => Returns_EmailForm;
};

export const items = [
  "Button",
  "EmailForm",
] as const;

export const entries = [
  '/Button/default',
  '/Button/secondary',
  '/EmailForm/default',
] as const;
