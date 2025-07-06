import React from "react";
import type { Params } from "../interface";

const Button = ({ text, onClick }: Params) => {
  return <button onClick={onClick}>{text}</button>;
};

export default Button;
