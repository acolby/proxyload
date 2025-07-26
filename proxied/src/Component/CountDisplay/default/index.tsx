import type { Interface } from "../interface";

const CountDisplay: Interface = (props) => {
  return (
    <form>
      <p>Count: {props.count}</p>
    </form>
  );
};

export default CountDisplay;
