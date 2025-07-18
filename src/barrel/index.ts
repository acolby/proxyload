import fs from "node:fs";
import path from "node:path";

export default async function barrel(params: {
  exclude: string[];
  dir: string;
}) {
  const { dir } = params;
  const types = fs
    .readdirSync(dir)
    .filter((name) => !name.includes("."))
    .filter((name) => !params.exclude.includes(name));

  for (const type of types) {
    const names = fs
      .readdirSync(path.resolve(dir, type))
      .filter((name) => !name.includes("."));

    const items = names.map((name) => {
      const variations = fs
        .readdirSync(path.resolve(dir, type, name))
        .filter((name) => !name.includes("."));
      return { name, variations };
    });

    for (const item of items) {
      await _writeFileIfChanged(
        path.resolve(`${dir}/${type}/${item.name}/index.ts`),
        _createVariationsFile({
          type,
          name: item.name,
          variations: item.variations,
        })
      );

      await _writeFileIfChanged(
        path.resolve(`${dir}/${type}/${item.name}/types.ts`),
        _createItemsTypeFile({
          type,
          name: item.name,
          variations: item.variations,
        })
      );
    }

    await _writeFileIfChanged(
      path.resolve(`${dir}/${type}/index.ts`),
      _createBarrelFile({
        type,
        items,
      })
    );

    await _writeFileIfChanged(
      path.resolve(`${dir}/index.ts`),
      _createTopLevelBarrelFile({
        types,
      })
    );
  }
}

async function _writeFileIfChanged(
  filePath: string,
  content: string
): Promise<void> {
  try {
    // Check if file exists and read current content
    const existingContent = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf-8")
      : null;

    // Only write if content has changed or file doesn't exist
    if (existingContent !== content) {
      await fs.promises.writeFile(filePath, content, "utf-8");
    }
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

function _createVariationsFile(params: {
  name: string;
  variations: string[];
  type: string;
}) {
  const { name, variations, type } = params;

  const imports: string[] = [];
  const variationEntries: string[] = [];

  // Generate import statements for each variation
  for (const variation of variations) {
    imports.push(`import ${name}_${variation} from "./${variation}";`);
    variationEntries.push(`    ${variation}: ${name}_${variation},`);
  }

  const fileContent = `// This file was generated by proxyload

import type { ${type}_${name} } from "./types";

${imports.join("\n")}

export const ${name}: ${type}_${name} = (props) => {
  const { variation = "${variations[0]}" } = props;
  return ${variationEntries.join("\n")}[variation || "${variations[0]}"](props);
};
`;

  return fileContent;
}

function _createItemsTypeFile(params: {
  type: string;
  name: string;
  variations: string[];
}) {
  const { type, name, variations } = params;
  return `// This file was generated by proxyload

import type { Params, Returns } from "./interface";

type Variations = ${variations.map((v) => `"${v}"`).join(" | ")};

export type ${type}_${name} = (
  props: Params & { variation?: Variations; version?: string }
) => Returns;
`;
}

function _createBarrelFile(params: {
  type: string;
  items: { name: string; variations: string[] }[];
}) {
  const { items } = params;
  const imports: string[] = [];

  // import the interface types
  for (const item of items) {
    // Add import statements
    imports.push(`export { ${item.name} } from "./${item.name}";`);
  }

  // Generate the complete file content
  const fileContent = `// This file was generated by proxyload

${imports.join("\n")}
`;

  return fileContent;
}

function _createTopLevelBarrelFile(params: { types: string[] }) {
  const { types } = params;
  const imports: string[] = [];

  // import the interface types
  for (const type of types) {
    // Add import statements
    imports.push(`export * as ${type} from "./${type}";`);
  }

  const fileContent = `// This file was generated by proxyload

${imports.join("\n")}
`;

  return fileContent;
}
