import React from "react";
import { Component } from "../../..";
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
