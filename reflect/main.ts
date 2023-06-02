//
// Run with:
// > deno run --allow-read=.. --allow-write=.. .\main.ts ..\examples\mithril.ts
//

//
// TODO(nick):
// - classes
// - fields
// - methods
// - getters/setters (modeled as fields)
// - union types (non-templated)
// - Record<string, number>
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

/*
import * as tsAstParser from "./core/src/index.ts";

const parseFromSource = (code, compilerOptions) => {
  const defaultCompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    declaration: true,
    allowJs: true,
  };

  const builtinDecls = `
  type Array<T> = T[];
  type String = string;
  type Object = object;
  type Boolean = boolean;
  type Number = number;
  type Element = unknown;
  `;

  const mod = tsAstParser.parseFromSource(builtinDecls + code, compilerOptions || defaultCompilerOptions);
  return mod;
};
*/

//
// Main
//

const main = async () => {
  const filePath = Deno.args[0];

  const f = await stat(filePath);
  assert(f, `File or directory not found: "${filePath}"`);

  if (f.isFile)
  {
    const code = Deno.readTextFileSync(filePath);
    /*
    const mod = parseFromSource(code);
    mod._node.fileName = path.resolve(filePath);
    const json = mod.serialize();
    Deno.writeTextFileSync("output.json", JSON.stringify(json, null, 2));
    */

    const sourceFile = ast.parseFromSource(filePath, code);

    const results = ast.dumpTree(sourceFile);
    console.log(results.children);
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

    const mods = files.map((it) => {
      const code = Deno.readTextFileSync(it);
      return parseFromSource(code, tsConfig?.compilerOptions);
    });

    console.log(mods.map((mod) => mod.serialize()));
  }
};

main();