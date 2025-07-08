import build from "../../src/build";

console.log("building...");

build({
  dir: `${__dirname}/../src`,
  dist: `${__dirname}/../dist`,
  globals: {
    "@proxied": "_PROXIED_",
    "react/jsx-runtime": "JSX",
    react: "React",
  },
});
