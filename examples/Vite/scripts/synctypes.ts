import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import typesync from "../../../src/typesync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await typesync({
  dest: resolve(__dirname, "../src/proxied/types"),
  host: "http://localhost:3012",
  key: "latest",
});
