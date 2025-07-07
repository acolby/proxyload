import { Component } from "@proxied";
import type { Interface } from "../interface";
import { Name } from "./comp";

const EmailForm: Interface = (props) => {
  return (
    <form>
      <input
        type="email"
        name="email"
      />
      <Name name="John" />
      <Component.Button
        text="Submit"
        onClick={() => {
          props.onSubmit("email");
        }}
      />
    </form>
  );
};

export default EmailForm;
