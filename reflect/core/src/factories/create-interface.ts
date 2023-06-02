import type { InterfaceDeclaration } from '../models/interface.ts';
import { InterfaceNode } from '../nodes/interface-node.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import ts from 'npm:typescript@5.0.4';


export const interfaceFactory: NodeFactory<InterfaceDeclaration, InterfaceNode, ts.InterfaceDeclaration> = {

    isNode: (node: ts.Node): node is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(node),

    create: (node: ts.InterfaceDeclaration, context: AnalyzerContext): InterfaceNode[] => {
        return [new InterfaceNode(node, context)];
    },

};
