import type { Interface } from "../interface";

const Button: Interface = ({ text, onClick }) => {
  return <button onClick={onClick}>{text}</button>;
};

export default Button;
