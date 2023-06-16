//
// Run with:
// > deno run --allow-read=.. --allow-write=.. .\main.ts ..\examples\test.ts
//

import ts from "npm:typescript@5.0.4";
import path from 'node:path';
import { expandGlobSync } from "https://deno.land/std@0.121.0/fs/expand_glob.ts";

import * as ast from './ast.ts';

//
// Helpers
//

const stat = async (filePath) => {
  let file = null;
  try {
    file = await Deno.stat(filePath);
  } catch (err) {
  }
  return file;
};

const assert = (cond, message, ...rest) => {
  if (!cond) {
    console.error(message, ...rest);
    Deno.exit(1);
  }
};

//
// Main
//

const main = async () => {
  const filePath = Deno.args[0];

  const f = await stat(filePath);
  assert(f, `File or directory not found: "${filePath}"`);

  if (f.isFile)
  {
    const schema = ast.generateSchemaFromFile(filePath);
    
    const output = JSON.stringify(schema, null, 2);
    Deno.writeTextFileSync("output.json", output);
  }
  else
  {
    let tsConfig = null;
    {
      const tsConfigPath = path.join(filePath, "tsconfig.json");
      const hasTSConfig = (await stat(tsConfigPath))?.isFile;
      if (hasTSConfig) {
        tsConfig = JSON.parse(await Deno.readTextFile(tsConfigPath));
      }
    }

    const files = Array.from(expandGlobSync(`${filePath}\/**\/*.ts`)).map((it) => it.path);

    // @Incomplete: mulitple file support doesn't accept TSConfig yet
    const schema = ast.generateSchemaFromFiles(files, tsConfig?.compilerOptions);

    const output = JSON.stringify(schema, null, 2);
    Deno.writeTextFileSync("output.json", output);
  }
};

main();