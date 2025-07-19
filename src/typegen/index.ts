import fs from "node:fs";
import path from "node:path";

/*
goes through the target directory and finds all interface files and exposes them as a JSON object
*/

export default async function typegen(params: { dir: string; dist: string }) {
  const interfaceFiles = await _findInterfaceFiles(params);

  // push to dist under types.json
  fs.writeFileSync(
    path.resolve(params.dist, "types.json"),
    JSON.stringify(interfaceFiles, null, 2)
  );
}

async function _findInterfaceFiles(params: { dir: string }) {
  // find dir names in dir
  const typeNames = fs
    .readdirSync(params.dir)
    .filter((name) => !name.includes("."));

  const interfaceFiles: Record<string, string> = {};

  for (const typeName of typeNames) {
    const itemNames = fs
      .readdirSync(path.resolve(params.dir, typeName))
      .filter((name) => {
        return name.indexOf(".") === -1;
      });

    for (const itemName of itemNames) {
      const interfaceContent = fs.readFileSync(
        path.resolve(params.dir, typeName, itemName, "interface.ts"),
        "utf-8"
      );

      interfaceFiles[`/${typeName}/${itemName}/interface.ts`] =
        interfaceContent;
    }
  }
  return interfaceFiles;
}
