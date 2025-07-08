import type { Params } from "../interface";

const Button = ({ text, onClick }: Params) => {
  return (
    <button
      style={{
        backgroundColor: "green",
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
