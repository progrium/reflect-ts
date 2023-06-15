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
  if (kind.kind) kind = kind.kind;
  return tsSyntaxKindToName[kind] || null;
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

const parseTypes = (type, code) => {
  let result = { kind: getKind(type), types: [] };

  if (result.kind === 'FunctionType' || result.kind === 'MethodSignature' || result.kind === 'MethodDeclaration') {
    return {
      kind: result.kind,
      parameters: type.parameters.map((it) => ({
        name: it.name?.escapedText,
        optional: isOptional(it),
        types: parseTypes(it, code),
      })),
      returnType: parseTypes(type.type, code),
    };
  }

  if (type.type) {
    return parseTypes(type.type, code);
  }

  // NOTE(nick): reduce types into simpler things if possible
  if (result.kind === 'StringKeyword') return 'string';
  if (result.kind === 'NumberKeyword') return 'number';
  if (result.kind === 'BooleanKeyword') return 'boolean';
  if (result.kind === 'ObjectKeyword') return 'object';
  if (result.kind === 'VoidKeyword') return 'void';
  if (result.kind === 'UndefinedKeyword') return 'undefined';

  if (type.types)
  {
    result.types = type.types.map((it) => parseTypes(it, code));
    return result;
  }

  if (type.elementType)
  {
    // NOTE(nick): arrays
    result.types = [parseTypes(type.elementType, code)];
  }
  else if (type.typeArguments)
  {
    result = {
      kind: 'GenericType',
      name: type.typeName.escapedText,
      typeArguments: type.typeArguments.map((it) => parseTypes(it, code)),
    };

    // NOTE(nick): special case for array type
    if (result.name === 'Array')
    {
      result.kind = 'ArrayType';
      result.typeArguments = [result.typeArguments[0]];
    }

    if (result.name === 'Record')
    {
      result.kind = 'ObjectType';
    }
  }
  else if (type.typeName)
  {
      result = parseTypes(type.typeName, code);
  }
  else
  {
    const text = code.slice(type.pos, type.end).trim();
    if (text === 'null') return 'null';
    result.types = [{ text }];
  }

  return result;
};

export const resolveIdentifier = (rootNode, name) => {
  const children = getChildren(rootNode);
  for (let i = 0; i < children.length; i += 1)
  {
    const node = children[i];
    if (getName(node) === name) {
      return node;
    }
  }
  return null;
};

export const resolveNestedIdentifierTypes = (context, types) => {
};

export const inflate = (schema, node, context = { code: '', filePath: '' }) => {
  print("[inflate]", getKind(node), getName(node));
  const kind = getKind(node);
  const name = getName(node);

  switch (kind)
  {
    case 'ClassDeclaration':
    case 'InterfaceDeclaration': {
      const props = getProperties(node);
      props.forEach((prop) => {
        const name = getName(prop);
        const types = parseTypes(prop, context.code);
        const optional = isOptional(prop);
        print("prop", name, optional, types);
      });

      const methods = getMethods(node);
      methods.forEach((method) => {
        const name = getName(method);
        const types = parseTypes(method, context.code);
        const optional = isOptional(method);
        print("method", name, optional, types);
      });
    } break;

    case 'TypeAliasDeclaration': {
      const name = getName(node);

      const types = parseTypes(node.type, context.code);
      print("type", name, types);
      //const idents = resolveNestedIdentifierTypes(context, types);
    } break;

    default: {
      print("[inflate] Unhandled TS node kind:", kind, name);
    } break;
  }
};

export const generateSchemaFromFile = (filePath) => {
  const schema = { All: [], Types: {} };

  const code = Deno.readTextFileSync(filePath);
  const rootNode = parseFromSource(filePath, code);

  const children = getChildren(rootNode);
  for (let i = 0; i < children.length; i += 1)
  {
    const node = children[i];
    const exported = isExported(node);
    if (exported)
    {
      inflate(schema, node, { code, filePath, rootNode });
    }
  }

  return schema;
};