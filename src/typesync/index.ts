import fs from "fs";
import path from "path";
import { TypesyncParams } from "../types";

export default async function typesync(params: TypesyncParams) {
  const { host, dest, key } = params;
  const types = await fetch(`${host}/releases/${key}/types.json`);
  const typesJson = await types.json();

  // for each item make the dir relative to the dest and write the contents of the file to the dir
  for (const key in typesJson) {
    const fullpath = path.join(dest, key);
    const dir = path.dirname(fullpath);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullpath, typesJson[key]);
  }
}
