//
// Run with:
// > deno run --allow-read=.. --allow-write=.. .\main.ts ..\examples\test.ts
//

import ts from "npm:typescript@5.0.4";
import path from 'node:path';
import { expandGlobSync } from "https://deno.land/std@0.121.0/fs/expand_glob.ts";

import * as ast from './ast.ts';

import { Foo } from '../examples/test.ts';

/*
class Foo {
}
ast.ReflectType(Foo);
*/

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
  const filePath = path.resolve(Deno.args[0]);

  const f = await stat(filePath);
  assert(f, `File or directory not found: "${filePath}"`);

  let schema = null;
  let relativePath = filePath;

  if (f.isFile)
  {
    // TODO(nick): allow an option to specify a tsconfig path?
    schema = ast.generateSchema(filePath);
    relativePath = path.dirname(filePath);
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

    // TODO(nick): actually parse the `includes` in the `tsconfig`?
    const files = Array.from(expandGlobSync(`${filePath}\/**\/*.ts`)).map((it) => it.path);

    schema = ast.generateSchemaFromFiles(files, tsConfig?.compilerOptions);
  }

  if (schema)
  {
    console.log("schema.Types =", schema.Types);
    console.log("schema.Exports =", schema.Exports().map((it) => it.Name));

    schema = ast.normalizeTypes(schema);
    schema = ast.makeRelativeSchema(schema, path.dirname(relativePath));

    console.log("schema.Types =", schema.Types);
    console.log("schema.Exports =", schema.Exports().map((it) => it.Name));

    const json = ast.toJSON(schema);
    Deno.writeTextFileSync("output.json", json);

    const testSchema = ast.loadSchema(json);
    const fooSchema = testSchema.GetTypeByName('Foo');

    const fooType = testSchema.TypeOf(Foo);

    console.log(testSchema.AssignableTo(fooSchema, fooType));
  }
};

main();