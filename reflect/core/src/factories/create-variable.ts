import type { VariableDeclaration } from '../models/variable.ts';
import { isFunctionDeclaration } from '../utils/function.ts';
import { VariableNode } from '../nodes/variable-node.ts';
import { isClassDeclaration } from '../utils/class.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import ts from 'npm:typescript@5.0.4';


export const variableFactory: NodeFactory<VariableDeclaration, VariableNode, ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.VariableStatement => {
        return ts.isVariableStatement(node) && !isFunctionDeclaration(node) && !isClassDeclaration(node);
    },

    create: (node: ts.VariableStatement, context: AnalyzerContext): VariableNode[] => {
        const result: VariableNode[] = [];

        for (const declaration of node.declarationList.declarations) {
            result.push(new VariableNode(node, declaration, context));
        }

        return result;
    },

};
