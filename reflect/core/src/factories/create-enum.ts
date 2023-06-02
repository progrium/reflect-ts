import type { EnumDeclaration } from '../models/enum.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import { EnumNode } from '../nodes/enum-node.ts';
import ts from 'npm:typescript@5.0.4';


export const enumFactory: NodeFactory<EnumDeclaration, EnumNode, ts.EnumDeclaration> = {

    isNode: (node: ts.Node): node is ts.EnumDeclaration => {
        return ts.isEnumDeclaration(node);
    },

    create: (node: ts.EnumDeclaration, context: AnalyzerContext): EnumNode[] => {
        return [new EnumNode(node, context)];
    },

};
