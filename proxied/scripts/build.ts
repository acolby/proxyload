import build from "../../src/build";
import barrel from "../../src/barrel";
import typegen from "../../src/typegen";

const GLOBALS = {
  "@proxied": "_PROXIED_",
  "react/jsx-runtime": "JSX",
  react: "React",
};

async function main() {
  const dir = `${__dirname}/../src`;
  const dist = `${__dirname}/../dist`;

  console.log("barrel...");
  await barrel({
    dir,
    exclude: [],
  });

  console.log("typegen...");
  await typegen({
    dir,
    dist,
  });

  console.log("build...");
  await build({
    dir,
    dist,
    globals: GLOBALS,
  });
}

main();
