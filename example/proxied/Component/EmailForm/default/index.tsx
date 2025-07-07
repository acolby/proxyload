import { Component } from "@proxied";
import type { Interface } from "../interface";

const EmailForm: Interface = (props) => {
  return (
    <form>
      <input
        type="email"
        name="email"
      />
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
