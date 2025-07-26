import build from "../../src/build";
import barrel from "../../src/barrel";
import typegen from "../../src/typegen";

const dependencies = {
  "react/jsx-runtime": {},
  react: {},
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
    key: "latest",
  });

  console.log("build...");
  await build({
    dir,
    dist,
    key: "latest",
    dependencies,
    proxyRef: "@proxied",
    loaders: {
      Component: "Loader/Component/default",
    },
  });
}

main();
