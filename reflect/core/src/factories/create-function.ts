import type { FunctionDeclaration } from '../models/function.ts';
import { isFunctionDeclaration } from '../utils/function.ts';
import { FunctionNode } from '../nodes/function-node.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Method } from '../models/member.ts';
import ts from 'npm:typescript@5.0.4';


export const functionFactory: NodeFactory<FunctionDeclaration | Method, FunctionNode, ts.VariableStatement | ts.FunctionDeclaration> = {

    isNode: isFunctionDeclaration,

    create: (node: ts.VariableStatement | ts.FunctionDeclaration, context: AnalyzerContext): FunctionNode[] => {
        return [new FunctionNode(node, context)];
    },

};
