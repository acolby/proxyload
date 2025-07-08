import typegen from "../../src/typegen";

console.log("building...");

typegen({
  dir: `${__dirname}/../src`,
  dist: `${__dirname}/../dist`,
});
