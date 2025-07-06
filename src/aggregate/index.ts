import fs from "node:fs";
import path from "node:path";

export default async function aggregate(params: {
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

    fs.writeFileSync(
      path.resolve(__dirname, `../src/${type}/index.ts`),
      _aggregateItems({
        type,
        items,
      })
    );
  }
}

function _aggregateItems(params: {
  type: string;
  items: { name: string; variations: string[] }[];
}) {
  const { type, items } = params;
  const imports: string[] = [];
  const variationTypes: string[] = [];
  const typeEntries: string[] = [];
  const idEntries: string[] = [];
  const entries: string[] = [];

  // import the interface types
  for (const item of items) {
    // Add import statements
    imports.push(
      `import type { Params as Params_${item.name}, Returns as Returns_${item.name} } from "./${item.name}/interface";`
    );

    // Add import statements
    variationTypes.push(
      `type ${item.name}_variations = ${item.variations
        .map((item) => `"${item}"`)
        .join(" | ")};`
    );

    typeEntries.push(
      `  ${item.name}: (props: Params_${item.name} & { variation?: ${item.name}_variations; version?: string; }) => Returns_${item.name};`
    );

    idEntries.push(`"${item.name}"`);

    for (const variation of item.variations) {
      entries.push(`'/${item.name}/${variation}'`);
    }
  }

  // Generate the complete file content
  const fileContent = `
${imports.join("\n")}

${variationTypes.join("\n")}

export type types = {
${typeEntries.join("\n")}
};

export const items = [
  ${idEntries.join(",\n  ")},
] as const;

export const entries = [
  ${entries.join(",\n  ")},
] as const;
`;

  return fileContent;
}
