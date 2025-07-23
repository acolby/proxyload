import fs from "node:fs";
import path from "node:path";

/*
goes through the target directory and finds all interface files and exposes them as a JSON object
*/

export default async function typegen(params: {
  dir: string;
  dist: string;
  key: string;
}) {
  // Ensure the dist directory exists
  const dest = path.resolve(params.dist, "releases", params.key);
  fs.mkdirSync(dest, { recursive: true });

  const interfaceFiles = await _findInterfaceFiles(params);
  const barrelIndex = _generateBarrelIndex(interfaceFiles);

  // Add the barrel index to the interface files
  interfaceFiles["index.ts"] = barrelIndex;

  // push to dist under types.json
  fs.writeFileSync(
    path.resolve(dest, "types.json"),
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

function _generateBarrelIndex(interfaceFiles: Record<string, string>): string {
  const imports: string[] = [];
  const typeGroups: Record<string, string[]> = {};

  // Parse file paths and organize by type
  for (const filePath of Object.keys(interfaceFiles)) {
    if (filePath === "index.ts") continue; // Skip the index file itself

    const pathParts = filePath.split("/").filter(Boolean);
    if (pathParts.length >= 3) {
      const typeName = pathParts[0];
      const itemName = pathParts[1];

      if (!typeGroups[typeName]) {
        typeGroups[typeName] = [];
      }

      // Generate import statement
      const importName = `${typeName}_${itemName}`;
      imports.push(
        `import { Interface as ${importName} } from ".${filePath}";`
      );

      // Add to type group
      typeGroups[typeName].push(`${itemName}: ${importName}`);
    }
  }

  // Generate type definitions
  const typeDefinitions: string[] = [];
  for (const [typeName, items] of Object.entries(typeGroups)) {
    typeDefinitions.push(`type ${typeName} = {`);
    typeDefinitions.push(`  ${items.join(";\n  ")};`);
    typeDefinitions.push(`};`);
  }

  // Generate single export
  const exportStatement = `export type Proxied = {`;
  const exportProperties = Object.keys(typeGroups)
    .map((typeName) => `  ${typeName}: ${typeName};`)
    .join("\n");
  const exportEnd = `};`;

  return [
    ...imports,
    "",
    ...typeDefinitions,
    "",
    exportStatement,
    exportProperties,
    exportEnd,
  ].join("\n");
}
