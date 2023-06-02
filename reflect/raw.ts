const fileName = 'unknown.ts';
const code = `
type Element = unknown;
type Array<T> = T[]

export interface Vnode {
  tag: string|object;
  key?: string;
  attrs?: object;
  children?: Array<any>|string|number|boolean;
  text?: string|number|boolean;
  dom?: Element; // assume this isn't defined
  domSize?: number;
  state?: object;
  events?: object;
  instance?: object;
}

type Child = Vnode | string | number | boolean | null | undefined;
interface ChildArray extends Array<Children> { }
type Children = Child | ChildArray;


export interface Component {
  view(vnode: Vnode): Children | null | void;
}

export const getText = (node: Vnode) => {
  return node?.text;
};
`;

/*

import ts from "npm:typescript@5.1.3";

const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest);

const isExported = (node) => {
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
}

const getName = (node) => {
  if (node.name) {
    return node.name.escapedText;
  }

  if (node.declarationList?.declarations?.length > 0) {
    const declarations = node.declarationList.declarations;
    return declarations[0].name.escapedText;
  }

  return null;
}

console.log(sourceFile);

ts.forEachChild(sourceFile, (node) => {
  if (isExported(node)) {
    console.log("exported", getName(node));
  }
});

ts.forEachChild(sourceFile, (node) => {
  if (isExported(node)) {

    if (ts.isInterfaceDeclaration(node))
    {
      console.log("interface!", node.members);
    }
  }
});
*/