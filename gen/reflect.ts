import { makeSchema, traverse, toFullyQualifiedName } from './shared.ts';

export const loadSchema = (schema) => {
  if (typeof schema === 'string')
  {
    try {
      schema = JSON.parse(schema);
    } catch(err) {
    }
  }

  const result = makeSchema({ ...schema });

  traverse(result, (node, { parent, key, index }) => {
    if (node.$type) {
      const type = result.Types[node.$type];
      if (index >= 0) {
        parent[key][index] = type;
      } else {
        parent[key] = type;
      }
    }
  });

  return result;
};

export const Type = (clazz, file = null) => {
  if (!file) {
    const message = new Error().stack;
    file = message.split('at ')[2];
  }

  //
  // NOTE(nick): in Deno this looks like:
  // C:/dev/_projects/progrium/reflect-ts/gen/main.ts:14:5
  //
  if (file.includes('file:///')) {
    const index = file.indexOf('file:///');
    file = file.slice(index + 'file:///'.length);
  }

  const lastSlash = file.lastIndexOf('/');
  if (lastSlash >= 0) {
    const lastColon = file.indexOf(':', lastSlash + 1);
    if (lastColon >= 0) {
      file = file.slice(0, lastColon);
    }
  }

  const fqn = toFullyQualifiedName({ Name: clazz.name, PkgPath: file });
  clazz.__fqn = fqn;
};