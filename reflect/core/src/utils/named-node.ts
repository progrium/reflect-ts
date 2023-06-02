import ts from 'npm:typescript@5.0.4';


export type NamedNodeName = ts.Identifier | ts.PrivateIdentifier | ts.ComputedPropertyName;

export function isNamedNode(node: ts.Node): node is ts.Node & { name: NamedNodeName } {
    const name: ts.Node | undefined = (node as unknown as { name: ts.Node | undefined }).name;

    return !!name && (ts.isMemberName(name) || ts.isComputedPropertyName(name));
}
