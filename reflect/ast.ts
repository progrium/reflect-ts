import ts from "npm:typescript@5.0.4";

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

export const getType = (node) => {
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isUnionTypeNode(node)) return 'union';
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isMethodDeclaration(node)) return 'method';
  if (ts.isPropertyDeclaration(node)) return 'property';
  if (ts.isGetAccessor(node)) return 'getter';
  if (ts.isSetAccessor(node)) return 'setter';
  if (ts.isImportDeclaration(node)) return 'import';
  if (ts.isExportDeclaration(node)) return 'export';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isTypeReferenceNode(node)) return 'ref';

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

export const getTSKindName = (kind) => {
  const found = Object.entries(ts.SyntaxKind).find(([key, value]) => value === kind);
  if (found) {
    return found[0];
  }
}

/*
const getExtends = (node) => {
  const extends = node.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);
  if (extends) {
    return extens.types
  }
};
*/

export const dumpTree = (node) => {
  return {
    kind: getTSKindName(node.kind),
    type: getType(node),
    name: getName(node),
    children: getChildren(node).map((child) => dumpTree(child)),
    exported: isExported(node),
  };
};
