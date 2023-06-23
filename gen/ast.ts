import path from 'node:path';
import ts from "npm:typescript@5.0.4";

const print = (...args) => console.log(...args);

export const isExported = (node) => {
  if (ts.canHaveModifiers(node)) {
    const modifiers = ts.getModifiers(node) || [];
    if (modifiers.some((it) => it.kind === ts.SyntaxKind.ExportKeyword)) {
      return true;
    }
  }

  if (ts.isExportAssignment(node) || ts.isExportDeclaration(node)) {
    return true;
  }

  return false;
};

export const getAccessModifier = (node) => {
  if (ts.canHaveModifiers(node)) {
    const modifiers = ts.getModifiers(node) || [];
    if (modifiers.length > 0) {
      // NOTE(nick): this will only return the _first_ access modifier
      if (modifiers.some((it) => it.kind === ts.SyntaxKind.PublicKeyword)) return 'public';
      if (modifiers.some((it) => it.kind === ts.SyntaxKind.ProtectedKeyword)) return 'protected';
      if (modifiers.some((it) => it.kind === ts.SyntaxKind.PrivateKeyword)) return 'private';
      // @Incomplete: you should be able to have a `readonly public` member - how should we handle that?
      if (modifiers.some((it) => it.kind === ts.SyntaxKind.ReadonlyKeyword)) return 'readonly';
    }
  }

  return null;
}

export const hasFlag = (flags, flagToCheck) => {
  return (flags & flagToCheck) === flagToCheck;
}

export const isOptional = (node) => {
  if (node.symbol) {
    return hasFlag(node.symbol.flags, ts.SymbolFlags.Optional);
  }

  if (node.questionToken) {
    return true;
  }

  return false;
}

export const getName = (node) => {
  if (node.escapedText) {
    return node.escapedText;
  }

  if (node.name) {
    return node.name.escapedText;
  }

  if (node.typeName) {
    return node.typeName.escapedText;
  }

  if (node.declarationList?.declarations?.length > 0) {
    const declarations = node.declarationList.declarations;
    return declarations[0].name.escapedText;
  }

  return null;
};

export const getChildren = (rootNode) => {
  const results = [];
  ts.forEachChild(rootNode, (node) => {
    if (node.kind === ts.SyntaxKind.EndOfFileToken) return;
    results.push(node);
  });
  return results;
}

const tsSyntaxKindToName = {};
Object.entries(ts.SyntaxKind).forEach(([key, value]) => {
  tsSyntaxKindToName[value] = key;
});

export const getKind = (kind) => {
  if (kind) {
    if (kind.kind) kind = kind.kind;
    return tsSyntaxKindToName[kind] || null;
  }
  return null;
};

export const getProperties = (node) => {
  return node.members.filter((it) => {
    const kind = getKind(it);
    return kind === 'PropertySignature' || kind === 'PropertyDeclaration';
  });
};

export const getMethods = (node) => {
  return node.members.filter((it) => {
    const kind = getKind(it);
    return kind === 'MethodSignature' || kind === 'MethodDeclaration';
  });
}

export const getExtends = (node) => {
  if (node.heritageClauses?.length > 0) {
    // @Incomplete: can heritageClauses ever be > 1?
    return node.heritageClauses[0].types;
  }
  return [];
}

class Type {
  constructor(obj) {
    Object.assign(this, obj);
  }
};

class Field {
  constructor(obj) {
    Object.assign(this, obj);
  }
};

class Argument {
  constructor(obj) {
    Object.assign(this, obj);
  }
};

class Schema {
  Types = {};

  constructor(obj) {
    Object.assign(this, obj);
  }

  Exports = () => {
    return Object.values(this.Types).filter((it) => it.Visibility === 'exported');
  }

  All = () => {
    return Object.values(this.Types);
  };

  GetTypesByName = (name) => {
    return this.All().filter((it) => it.Name === name);
  };

  GetTypeByName = (name) => {
    return this.All().find((it) => it.Name === name);
  };

  TypeOf = (x) => {
    let result = null;
    if ((typeof x === 'object' && x !== null) || (typeof x === 'function'))
    {
      const fqn = x.prototype.__fqn || x.__fqn;
      if (typeof fqn === 'string') {
        result = this.Types[fqn] || null;
      }
    }
    return result;
  }

  AssignableTo = (t, dest) => {
    if (t === dest) return true;
    if (dest.Kind === 'struct') {
      // TODO(nick): check if t fields overlap with dest fields (recursivley, if .Types)
    }
    return false;
  }
};

const makeType = (obj = {}) => new Type({
  Name: '',
  PkgPath: '',
  Kind: 'null',

  // for Structs
  Fields: [],

  // for Classes
  Methods: [],
  Extends: [],

  // for Funcs
  IsVariadic: false,
  Ins: [],
  Outs: [],
  Self: null, // for Methods

  // for Maps
  Key: null,

  // for Arrays
  Len: 0,

  // for Array,Chan,Map,Pointer,Slice
  Elem: null,

  Types: [], // for Unions

  // for exports
  Visibility: '',

  ...obj,
});

const makeField = (obj = {}) => new Field({
  Name: '',
  Type: null,
  Offset: 0,
  Anonymous: false,

  Optional: false,
  // for class members (fields and methods)
  Visibility: '',

  ...obj,
});

const makeArgument = (obj = {}) => new Argument({
  Name: '',
  Type: null,
  ...obj,
});

const makeSchema = (obj = {}) => new Schema({...obj});

// NOTE(nick): Normalize windows paths for consistency across platforms
const normalizePath = (filePath) => {
  return filePath.replaceAll('\\', '/');
}

const toFullyQualifiedName = (it) => {
  const pkgPath = normalizePath(it.PkgPath);

  const ext = path.extname(pkgPath);
  const prefix = ext.length > 0 ? pkgPath.slice(0, pkgPath.length - ext.length) : pkgPath;
  return it.Name.startsWith(prefix) ? it.Name : `${prefix}.${it.Name}`;
};

const mergeSchemas = (a, b) => {
  const result = makeSchema();

  a.All().forEach((it) => {
    const fullName = toFullyQualifiedName(it);
    result.Types[fullName] = it;
  });

  b.All().forEach((it) => {
    const fullName = toFullyQualifiedName(it);
    result.Types[fullName] = it;
  });

  return result;
};

export const traverse = (node, fn, ctx = {}) => {
  fn(node, ctx);

  const parent = node;

  if (typeof node.All === 'function') {
    node.All().forEach((it, index) => traverse(it, fn, { parent, key: 'All', index }));
  }

  const traverseArray = (node, key) => {
    if (Array.isArray(node[key])) {
      node[key].forEach((it, index) => traverse(it, fn, { parent: node, key, index }));
    }
  }

  traverseArray(node, 'Types');
  traverseArray(node, 'Extends');
  traverseArray(node, 'Methods');
  traverseArray(node, 'Fields');
  traverseArray(node, 'Ins');
  traverseArray(node, 'Outs');

  if (node.Type) traverse(node.Type, fn, { parent: node, key: 'Type', index: -1 });
  if (node.Elem) traverse(node.Elem, fn, { parent: node, key: 'Elem', index: -1 });
  if (node.Key) traverse(node.Key, fn, { parent: node, key: 'Key', index: -1 });
  if (node.Self) traverse(node.Self, fn, { parent: node, key: 'Self', index: -1 });
};

const relativeName = (prefix, key) => {
  let result = key;
  if (key.startsWith(prefix)) {
    result = key.slice(prefix.length, key.length);
  }
  return result;
}

export const makeRelativeSchema = (schema, relativePath) => {
  const result = makeSchema();

  relativePath = normalizePath(relativePath);

  Object.keys(schema.Types).forEach((key) => {
    const shortKey = relativeName(relativePath, key);
    result.Types[shortKey] = schema.Types[key];
  });

  traverse(result, (node) => {
    if (node.$type) {
      node.$type = relativeName(relativePath, node.$type);
    }
  });

  return result;
};

export const shallowClone = (node) => {
  if (node instanceof Type) {
    return makeType({...node});
  }
  if (node instanceof Field) {
    return makeField({...node});
  }
  if (node instanceof Argument) {
    return makeArgument({...node});
  }
  if (node instanceof Schema) {
    return makeSchema({...node});
  }
  return {...node};
};

const makeTypeAlias = (schema, node) => {
  if (!node) return null;

  node.Name = node.Name || 'Anonymous';
  node.PkgPath = node.PkgPath || '<unknown>';
  const fqn = toFullyQualifiedName(node);
  return { '$type': fqn };
};

export const flatten = (schema, node) => {
  if (!node) {
    return {};
  }

  const result = shallowClone(node);
  result.Name = result.Name || 'Anonymous';
  result.PkgPath = result.PkgPath || '<unknown>';
  const fqn = toFullyQualifiedName(result);

  if (result.Elem) {
    flatten(schema, result.Elem);
    result.Elem = makeTypeAlias(schema, result.Elem);
  }

  if (result.Key) {
    flatten(schema, result.Key);
    result.Key = makeTypeAlias(schema, result.Key);
  }

  const ret = {
    ...result,
    Types: result.Types.map((it) => {
      const type = shallowClone(it);
      flatten(schema, type);
      return makeTypeAlias(schema, type);
    }),
    Extends: result.Extends.map((it) => {
      const ext = shallowClone(it);
      flatten(schema, ext);
      return makeTypeAlias(schema, ext);
    }),
    Methods: result.Methods.map((it) => {
      const method = shallowClone(it);
      flatten(schema, method.Type);
      method.Self = makeTypeAlias(schema, method.Self);
      method.Type = makeTypeAlias(schema, method.Type);
      return method;
    }),
    Fields: result.Fields.map((it) => {
      const field = shallowClone(it);
      flatten(schema, field.Type);
      field.Type = makeTypeAlias(schema, field.Type);
      return field;
    }),
    Ins: result.Ins.map((it) => {
      const arg = shallowClone(it);
      flatten(schema, arg.Type);
      arg.Type = makeTypeAlias(schema, arg.Type);
      return arg;
    }),
    Outs: result.Outs.map((it) => {
      const type = shallowClone(it);
      flatten(schema, type);
      return makeTypeAlias(schema, type);
    }),
  };

  schema.Types[fqn] = ret;
  return ret;
};

export const normalizeTypes = (schema) => {
  const result = shallowClone(schema);

  result.All().forEach((type) => {
    const fqn = toFullyQualifiedName(type);
    flatten(result, type);
  });

  return result;
};

const makeInternalType = (schema, name) => {
  if (!schema.Types[name])
  {
    const type = makeType({ Kind: 'type', Name: name, PkgPath: '<internal>' });
    schema.Types[name] = type;
  }

  return schema.Types[name];
}

const makeLiteralType = (schema, name) => {
  // TODO(nick): figure out how to load default types for things?
  // e.g. lib.es5.d.ts
  
  /*
  const BUILTIN_TYPES = ['Partial'];
  if (BUILTIN_TYPES.includes(name))
  {
    return makeInternalType(schema, name);
  }
  */

  if (!schema.Types[name])
  {
    const type = makeType({ Kind: 'type', Name: name, PkgPath: '<unknown>' });
    schema.Types[name] = type;
  }

  return schema.Types[name];
}

const makeReferenceType = (schema, t) => {
  const result = makeType({ Kind: 'ref', Name: t.Name, PkgPath: '<ref>' });
  schema.Types[t.Name] = t;
  return result;
}

const maybeWrapBuiltinType = (node, typeName, context) => {
  // NOTE(nick): special cases
  if (typeName === 'Array') {
    const result = makeType({
      Kind: 'array',
      PkgPath: context.filePath,
      Elem: node.typeArguments?.length > 0 ? inflate(node.typeArguments[0], context) : null,
    });
    return result;
  }

  if (typeName === 'Record') {
    const result = makeType({
      Kind: 'map',
      PkgPath: context.filePath,
      Key: node.typeArguments?.length > 0 ? inflate(node.typeArguments[0], context) : null,
      Elem: node.typeArguments?.length > 0 ? inflate(node.typeArguments[1], context) : null,
    });
    return result;
  }

  return null;
};

const resolveImport = (currentFilePath, importPath) => {
  return path.resolve(path.dirname(currentFilePath), importPath);
};

export const inflate = (node, context) => {
  const { schema, filePath } = context;

  const kind = getKind(node);
  const name = getName(node);

  print("[inflate]", { kind, name });

  switch (kind)
  {
    case 'ImportDeclaration': {
      const globalContext = context.global;
      const importPath = resolveImport(filePath, node.moduleSpecifier.text);
      const importSchema = processSourceFile(context.global, importPath);
      if (importSchema)
      {
        node.importClause.namedBindings.elements.forEach((binding) => {
          const name = getName(binding);
          if (importSchema.Types[name]) {
            schema.Types[name] = importSchema.Types[name];
          } else {
            print(`[inflate] ImportDeclaration: Warning, symbol name '${name}' not found in import path:`, importPath);
          }
        });
      }

      return null;
    } break;

    case 'TypeLiteral':
    case 'ClassDeclaration':
    case 'InterfaceDeclaration': {
      // @Incomplete: parse `extends` keyword
      const result = makeType({ Name: name, Kind: 'struct', PkgPath: filePath });

      const props = getProperties(node);
      props.forEach((prop) => {
        const fieldName = getName(prop);
        const field = makeField({
          Name: fieldName,
          Type: inflate(prop.type, context),
          Anonymous: fieldName.startsWith('_'), // JS convention
        });

        if (isOptional(prop)) {
          field.Optional = true;
        }

        field.Visibility = getAccessModifier(prop);

        result.Fields.push(field);
      });

      const methods = getMethods(node);
      methods.forEach((method) => {
        const fieldName = getName(method);

        const field = makeField({
          Name: fieldName,
          Type: inflate(method, context),
          Anonymous: fieldName.startsWith('_'), // JS convention
        });

        if (isOptional(method)) {
          field.Optional = true;
        }

        field.Visibility = getAccessModifier(field);
        field.Self = result; // will produce a circlular reference (not JSON serializable!)

        result.Methods.push(field);
      });

      const baseTypes = getExtends(node);
      if (baseTypes.length > 0)
      {
        baseTypes.forEach((baseType) => {
          result.Extends.push(inflate(baseType, context));
        });
      }


      return result;
    } break;

    case 'MethodDeclaration':
    case 'MethodSignature':
    case 'FunctionDeclaration':
    case 'FunctionType': {
      const isVariadic = node.parameters.some((it) => !!it.dotDotDotToken);

      const result = makeType({
        Name: name,
        PkgPath: filePath,
        Kind: 'function',
        IsVariadic: isVariadic,
        Ins: node.parameters.map((param) => {
          const paramType = inflate(param.type, context);

          //
          // NOTE(nick): because JS supports functions like this:
          //
          // export function log(...args: any[]) {}
          // export function log2(label: string, ...args: any[]) {}
          //
          if (param.dotDotDotToken) paramType.IsVariadic = true;

          return makeArgument({
            Name: getName(param),
            Type: paramType,
          });
        }),
        Outs: node.type ? [inflate(node.type, context)] : [],
      });

      return result;
    } break;

    case 'TypeAliasDeclaration': {
      const nestedType = inflate(node.type, { ...context, parent: node });

      //
      // NOTE(nick): if we're reffering directly to an internal type, e.g.:
      // export type Foo = string;
      //
      // then we want some way to reference the internal type, so we generate a type alias.
      // Otherwise, we can just expose the nested type directly, e.g.:
      // export type Bar = string | number;
      //
      if (nestedType && (nestedType.PkgPath === '<internal>' || nestedType.PkgPath === '<unknown>'))
      {
        const result = makeType({
          Kind: 'alias',
          Name: name,
          Types: [nestedType],
          PkgPath: filePath
        });

        schema.Types[name] = result;
        return result;
      }

      // @Incomplete: should we always overwrite the type name?
      if (nestedType)
      {
        nestedType.Name = name;
        schema.Types[name] = nestedType;
      }

      return nestedType;
    } break;

    case 'ExpressionWithTypeArguments': {
      const typeName = node.expression.escapedText;

      const builtin = maybeWrapBuiltinType(node, typeName, context);
      if (builtin) {
        return builtin;
      }

      // imported from another file
      if (schema.Types[typeName]) {
        return schema.Types[typeName];
      }

      print("[inflate] Unresolved ExpressionWithTypeArguments for typeName:", typeName);
      return null;
    } break;

    case 'TypeReference': {
      if (node.typeName?.escapedText) {
        const typeName = node.typeName.escapedText;

        const builtin = maybeWrapBuiltinType(node, typeName, context);
        if (builtin) {
          return builtin;
        }

        // imported from another file
        if (schema.Types[typeName]) {
          return schema.Types[typeName];
        }

        // NOTE(nick): for things like Promise, etc.
        return makeLiteralType(schema, typeName);
      }

      //
      // NOTE(nick): for cases like:
      // type Bar2 = string | number;
      // export type Bar2;
      //
      // We rely on TypeAliasDeclaration to set the parent
      //
      if (context.parent) {
        const parentName = getName(context.parent);
        return schema.Types[parentName];
      }

      print("[inflate] TypeReference is missing context.parent!");
      return null;

    } break;

    case 'UnionType': {
      const types = node.types.map((it) => inflate(it, context));
      const result = makeType({
        Kind: 'union',
        Name: name,
        PkgPath: filePath,
        Types: types
      });
      return result;
    } break;

    case 'IntersectionType': {
      const types = node.types.map((it) => inflate(it, context));
      const result = makeType({
        Kind: 'intersection',
        Name: name,
        PkgPath: filePath,
        Types: types
      });
      return result;
    } break;

    case 'ArrayType': {
      const result = makeType({
        Kind: 'array',
        Name: name,
        PkgPath: filePath,
        Elem: node.elementType ? inflate(node.elementType, context) : null,
      });
      return result;
    } break;

    case 'LiteralType': {
      const code = context.rootNode.text;
      // @Incomplete: shouldn't null types actually be propagated upwards to make things optional?
      const literalName = node.literal ? code.slice(node.pos, node.end).trim() : null;
      if (literalName === 'null') {
        return makeInternalType(schema, 'null');
      }
      if (literalName === 'true') {
        return makeInternalType(schema, 'true');
      }
      if (literalName === 'false') {
        return makeInternalType(schema, 'false');
      }

      print("[inflate] Unhandled literal type:", literalName);
      return makeLiteralType(schema, literalName);
    } break;

    case 'Identifier': {
      const identName = node.escapedText;
      if (identName) {
        return schema.Types[identName];
      }

      print("[inflate] Unresolved identifier type:", identName);
      return null;
    } break;

    // NOTE(nick): reduce types into simpler things if possible
    case 'StringKeyword':    { return makeInternalType(schema, 'string'); } break;
    case 'NumberKeyword':    { return makeInternalType(schema, 'number'); } break;
    case 'BooleanKeyword':   { return makeInternalType(schema, 'boolean'); } break;
    case 'ObjectKeyword':    { return makeInternalType(schema, 'object'); } break;
    case 'VoidKeyword':      { return makeInternalType(schema, 'void'); } break;
    case 'UndefinedKeyword': { return makeInternalType(schema, 'undefined'); } break;
    case 'AnyKeyword':       { return makeInternalType(schema, 'any'); } break;

    default: {
      print("[inflate] Unhandled TS node kind:", kind, name);
      return null;
    } break;
  }
};

export const parseFromSource = (fileName, code) => {
  const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest);
  return sourceFile;
};

export const processSourceFile = (globals, filePath) => {
  if (globals.imports[filePath]) {
    return globals.imports[filePath];
  }

  print("[processSourceFile]", filePath);

  const rootNode = globals.program.getSourceFile(filePath);
  if (!rootNode) {
    return null;
  }

  const schema = makeSchema();

  const children = getChildren(rootNode);
  for (let i = 0; i < children.length; i += 1)
  {
    const node = children[i];
    const name = getName(node);

    const context = {
      global: globals,
      rootNode,
      filePath,
      schema,
    };

    const type = inflate(node, context);
    if (type)
    {
      if (isExported(node))
      {
        type.Visibility = 'exported';
        print("[processSourceFile] exported", name);
      }

      schema.Types[name] = type;
    }
  }

  globals.imports[filePath] = schema;
  return schema;
};

export const generateSchemaFromFiles = (filePaths, tsCompilerOptions = null) => {
  filePaths = filePaths.map((it) => {
    return path.resolve(it);
  });

  if (!tsCompilerOptions) {
    tsCompilerOptions = { target: ts.ScriptTarget.Latest };
  }

  const program = ts.createProgram(filePaths, tsCompilerOptions);

  const globalContext = {
    imports: {},
    program,
  };

  let schema = makeSchema();
  for (let file_index = 0; file_index < filePaths.length; file_index += 1)
  {
    const filePath = filePaths[file_index];
    const fileSchema = processSourceFile(globalContext, filePath);
    schema = mergeSchemas(schema, fileSchema);
  }

  return schema;
};

export const followAllImportsFromFile = (filePath, tsTarget = ts.ScriptTarget.Latest) => {
  const seen = {};

  const follow = [path.resolve(filePath)];
  while (follow.length > 0)
  {
    const filePath = follow[0];
    seen[filePath] = true;

    let code = null;
    try {
      code = Deno.readTextFileSync(filePath);
    } catch (err) {}

    if (code)
    {
      const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest);

      const children = getChildren(sourceFile).filter((it) => getKind(it) === 'ImportDeclaration');
      for (let i = 0; i < children.length; i += 1)
      {
        const node = children[i];
        const importPath = resolveImport(filePath, node.moduleSpecifier.text);
        if (!seen[importPath]) {
          follow.push(importPath);
        }
      }
    }

    follow.shift();
  }

  return Object.keys(seen);
};

export const generateSchema = (filePath, tsCompilerOptions = null) => {
  const target = tsCompilerOptions?.target || ts.ScriptTarget.Latest;
  const imports = followAllImportsFromFile(path.resolve(filePath), target);

  return generateSchemaFromFiles(imports, tsCompilerOptions);
};

export const toJSON = (schema) => {
  const replacer = (k, v) => {
    if (k === 'Self' && v?.Kind === 'struct') {
      return makeReferenceType(schema, v);
    }

    return v;
  };

  return JSON.stringify(schema, replacer, 2);
};

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