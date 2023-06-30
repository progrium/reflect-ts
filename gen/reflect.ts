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

export const ReflectType = (clazz, fqn = null) => {
  if (!fqn) {
    const message = new Error().stack;
    let file = message.split('at ')[2];

    //
    // NOTE(nick): in Deno this looks like:
    // C:/dev/_projects/progrium/reflect-ts/gen/main.ts:14:5
    //
    if (file.startsWith('file:///')) file = file.slice('file:///'.length);

    const lastSlash = file.lastIndexOf('/');
    if (lastSlash >= 0) {
      const lastColon = file.indexOf(':', lastSlash + 1);
      if (lastColon >= 0) {
        file = file.slice(0, lastColon);
      }
    }

    fqn = toFullyQualifiedName({ Name: clazz.name, PkgPath: file });
  }

  clazz.__fqn = fqn;
};