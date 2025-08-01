import fs from "node:fs";
import path from "node:path";
import { BarrelParams, InterfaceFile } from "../types";

export default async function barrel(params: BarrelParams) {
  const { dir } = params;
  const types = fs
    .readdirSync(dir)
    .filter((name) => !name.includes("."))
    .filter((name) => !params.exclude.includes(name));

  for (const type of types) {
    const names = fs
      .readdirSync(path.resolve(dir, type))
      .filter((name) => !name.includes("."));

    const items: InterfaceFile[] = names.map((name) => {
      const variations = fs
        .readdirSync(path.resolve(dir, type, name))
        .filter((name) => !name.includes("."));
      return { name, variations };
    });

    // Enhance interface files for each item
    for (const item of items) {
      await _enhanceInterfaceFile({
        dir,
        type,
        item,
      });
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

function _createBarrelFile(params: { type: string; items: InterfaceFile[] }) {
  const { items } = params;
  const imports: string[] = [];

  // import the interface types
  for (const item of items) {
    // Add import statements
    imports.push(
      `export { default as ${item.name} } from "./${item.name}/default";`
    );
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

async function _enhanceInterfaceFile(params: {
  dir: string;
  type: string;
  item: InterfaceFile;
}) {
  const { dir, type, item } = params;
  const interfacePath = path.resolve(dir, type, item.name, "interface.ts");

  // Read the existing interface file
  const originalInterface = fs.readFileSync(interfacePath, "utf-8");

  // Create the enhanced interface content
  const enhancedInterface = _createEnhancedInterface({
    originalInterface,
    variations: item.variations,
  });

  // Write the enhanced interface back to the file
  await _writeFileIfChanged(interfacePath, enhancedInterface);

  function _createEnhancedInterface(params: {
    originalInterface: string;
    variations: string[];
  }) {
    const { originalInterface, variations } = params;

    // Check if the file already has the generated content
    if (originalInterface.includes("// Generated by proxyload")) {
      // If it already has generated content, just return the original
      return originalInterface;
    }

    // Create the variations type
    const variationsType = `type Variations = ${variations
      .map((v) => `"${v}"`)
      .join(" | ")};`;

    // Create the component type
    const componentType = `export type Interface = (
  props: Params & { variation?: Variations; }
) => Returns;`;

    // Combine the original interface with the new types
    return `${originalInterface}

// Generated by proxyload
${variationsType}

${componentType}`;
  }
}
