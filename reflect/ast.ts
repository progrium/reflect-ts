import path from 'node:path';
import ts from "npm:typescript@5.0.4";

const print = (...args) => console.log(...args);

export const parseFromSource = (fileName, code) => {
  const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest);
  return sourceFile;
};

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
  let results = [];
  ts.forEachChild(rootNode, (node) => {
    if (node.kind === ts.SyntaxKind.EndOfFileToken) return;
    results.push(node);
  });

  if (ts.isInterfaceDeclaration(rootNode)) {
    results = results.filter((it) => it.kind === ts.SyntaxKind.PropertySignature);
  }

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

/*
const getExtends = (node) => {
  const extends = node.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);
  if (extends) {
    return extens.types
  }
};
*/

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

export const dumpTree = (node) => {
  return {
    kind: getKind(node.kind),
    name: getName(node),
    children: getChildren(node).map((child) => dumpTree(child)),
    exported: isExported(node),
  };
};

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
  constructor(obj) {
    Object.assign(this, obj);
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

  ...obj,
});

const makeField = (obj = {}) => new Field({
  Name: '',
  Type: null,
  Offset: 0,
  Anonymous: false,

  Optional: false,
  AccessModifier: '',

  ...obj,
});

const makeArgument = (obj = {}) => new Argument({
  Name: '',
  Type: null,
  ...obj,
});

const makeSchema = () => new Schema({
  Exports: [],
  Types: {},
});

const makeInternalType = (schema, name) => {
  if (!schema.Types[name])
  {
    const type = makeType({ Kind: 'type', Name: name, PkgPath: '<internal>' });
    schema.Types[name] = type;
  }

  return schema.Types[name];
}

const makeLiteralType = (schema, name) => {
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

export const inflate = (node, context) => {
  const { schema, filePath } = context;

  const kind = getKind(node);
  const name = getName(node);

  print("[inflate]", { kind, name });

  switch (kind)
  {
    case 'ClassDeclaration':
    case 'InterfaceDeclaration': {
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

        field.AccessModifier = getAccessModifier(prop);

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

        field.AccessModifier = getAccessModifier(method);
        field.Self = result; // will produce a circlular reference (not JSON serializable!)
        //field.Self = makeReferenceType(schema, result);

        result.Methods.push(field);
      });

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
      if (nestedType.PkgPath === '<internal>' || nestedType.PkgPath === '<unknown>')
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

      nestedType.Name = name;

      schema.Types[name] = nestedType;
      return nestedType;
    } break;

    case 'TypeReference': {
      if (node.typeName?.escapedText) {
        const typeName = node.typeName.escapedText;

        // NOTE(nick): special cases
        if (typeName === 'Array') {
          const result = makeType({
            Kind: 'array',
            PkgPath: filePath,
            Elem: node.typeArguments?.length > 0 ? inflate(node.typeArguments[0], context) : null,
          });
          return result;
        }

        if (typeName === 'Record') {
          const result = makeType({
            Kind: 'map',
            PkgPath: filePath,
            Key: node.typeArguments?.length > 0 ? inflate(node.typeArguments[0], context) : null,
            Elem: node.typeArguments?.length > 0 ? inflate(node.typeArguments[1], context) : null,
          });
          return result;
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

    case 'ArrayType': {
      const result = makeType({
        Kind: 'array',
        Name: name,
        PkgPath: filePath,
        Elem: node.elementType ? inflate(node.elementType, context) : null,
      });
      return result;
    } break;

    // NOTE(nick): reduce types into simpler things if possible
    case 'StringKeyword':    { return makeInternalType(schema, 'string'); } break;
    case 'NumberKeyword':    { return makeInternalType(schema, 'number'); } break;
    case 'BooleanKeyword':   { return makeInternalType(schema, 'boolean'); } break;
    case 'ObjectKeyword':    { return makeInternalType(schema, 'object'); } break;
    case 'VoidKeyword':      { return makeInternalType(schema, 'void'); } break;
    case 'UndefinedKeyword': { return makeInternalType(schema, 'undefined'); } break;
    case 'AnyKeyword':       { return makeInternalType(schema, 'any'); } break;

    case 'LiteralType': {
      // @Incomplete: shouldn't null types actually be propagated upwards to make things optional?
      const literalName = node.literal ? context.code.slice(node.pos, node.end).trim() : null;
      if (literalName === 'null') {
        return makeInternalType(schema, 'null');
      }

      print("[inflate] Unhandled literal type:", literalName);
    } break;

    default: {
      print("[inflate] Unhandled TS node kind:", kind, name);
      return null;
    } break;
  }
};

export const generateSchemaFromFiles = (filePaths) => {
  const schema = makeSchema();

  for (let file_index = 0; file_index < filePaths.length; file_index += 1)
  {
    const filePath = path.resolve(filePaths[file_index]);
    const code = Deno.readTextFileSync(filePath);
    const rootNode = parseFromSource(filePath, code);

    const children = getChildren(rootNode);

    const context = {
       code,
       filePath,
       schema,
    };

    for (let i = 0; i < children.length; i += 1)
    {
      const node = children[i];
      const name = getName(node);
      const exported = isExported(node);

      const type = inflate(node, context);
      if (type)
      {
        schema.Types[name] = type;

        if (exported)
        {
          schema.Exports.push(type);
        }
      }
    }
  }

  /*
  console.log(typeLUT);

  const context = {};

  for (let i = 0; i < children.length; i += 1)
  {
    const node = children[i];
    const exported = isExported(node);
    if (exported)
    {
      inflate(schema, node, context);
    }
  }
  */

  console.log("schema.Types =", schema.Types);
  //console.log("schema.Exports =", schema.Exports.map((it) => it.Name));
  console.log("schema.Exports =", schema.Exports);

  return schema;
};

export const generateSchemaFromFile = (filePath) => {
  return generateSchemaFromFiles([filePath]);
}
