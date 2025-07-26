import Proxied from "./proxied";
import React from "react";

export default function Home() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <Proxied.Component.EmailForm
        onSubmit={() => {
          console.log("submitted");
        }}
      />
      <Proxied.Component.Button
        text="Click me"
        onClick={() => {
          setCount(count + 1);
        }}
      />
      <Proxied.Component.CountDisplay count={count} />
    </div>
  );
}
