import type { TypeAliasDeclaration } from '../models/type-alias.ts';
import { TypeAliasNode } from '../nodes/type-alias-node.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import ts from 'npm:typescript@5.0.4';


export const typeAliasFactory: NodeFactory<TypeAliasDeclaration, TypeAliasNode, ts.TypeAliasDeclaration> = {

    isNode: (node: ts.Node): node is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(node),

    create: (node: ts.TypeAliasDeclaration, context: AnalyzerContext): TypeAliasNode[] => {
        return [new TypeAliasNode(node, context)];
    },

};
