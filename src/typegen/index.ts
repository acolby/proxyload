import fs from "node:fs";
import path from "node:path";

/*
goes throught the target directory and finds all interface and type files of items and merges them into an object that can easily be consumed by target applications
*/

export default async function typegen(params: { dir: string; dist: string }) {
  const typesFiles = await _findTypesFiles(params);
  const indexFile = await _createRolledUpIndexFile(params);

  const fullobj = {
    ...typesFiles,
    ["/index.ts"]: indexFile,
  };

  // push to dist under types.json
  fs.writeFileSync(
    path.resolve(params.dist, "types.json"),
    JSON.stringify(fullobj, null, 2)
  );
}

async function _findTypesFiles(params: { dir: string }) {
  // find dir names in dir
  const typeNames = fs
    .readdirSync(params.dir)
    .filter((name) => !name.includes("."));

  const typesFiles: Record<string, string> = {};

  for (const typeName of typeNames) {
    const itemNames = fs
      .readdirSync(path.resolve(params.dir, typeName))
      .filter((name) => {
        return name.indexOf(".") === -1;
      });

    for (const itemName of itemNames) {
      const inter = fs.readFileSync(
        path.resolve(params.dir, typeName, itemName, "interface.ts"),
        "utf-8"
      );

      typesFiles[`/${typeName}/${itemName}/interface.ts`] = inter;
    }
  }
  return typesFiles;
}

async function _createRolledUpIndexFile(params: { dir: string }) {
  // find dir names in dir
  const typeNames = fs
    .readdirSync(params.dir)
    .filter((name) => !name.includes("."));

  const importLines: string[] = [];
  const exportObj: string[] = [];

  for (const typeName of typeNames) {
    const itemNames = fs
      .readdirSync(path.resolve(params.dir, typeName))
      .filter((name) => {
        return name.indexOf(".") === -1;
      });

    exportObj.push(`  ${typeName}: {`);

    for (const itemName of itemNames) {
      const fullname = `${typeName}_${itemName}`;
      importLines.push(
        `import type { ${fullname} } from "./${typeName}/${itemName}/interface.ts";`
      );
      exportObj.push(`    ${itemName}: ${fullname};`);
    }

    exportObj.push(`  },`);
  }
  return `
${importLines.join("\n")}

export type ProxiedTypes = {
${exportObj.join("\n")}
};
`;
}
