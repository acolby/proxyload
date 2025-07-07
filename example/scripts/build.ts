import build from "../../src/build";

build({
  dir: `${__dirname}/../proxied`,
  dist: `${__dirname}/../dist`,
  globals: {
    "@proxied": "_PROXIED_",
    "react/jsx-runtime": "JSX",
    react: "React",
  },
});
