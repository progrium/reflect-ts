import type { ClassDeclaration } from '../models/class.ts';
import { isClassDeclaration } from '../utils/class.ts';
import type { AnalyzerContext } from '../context.ts';
import type { NodeFactory } from './node-factory.ts';
import { ClassNode } from '../nodes/class-node.ts';
import ts from 'npm:typescript@5.0.4';


export const classFactory: NodeFactory<ClassDeclaration, ClassNode, ts.ClassDeclaration | ts.VariableStatement> = {

    isNode: (node: ts.Node): node is ts.ClassDeclaration | ts.VariableStatement => {
        return isClassDeclaration(node);
    },

    create: (node: ts.ClassDeclaration | ts.VariableStatement, context: AnalyzerContext): ClassNode[] => {
        return [new ClassNode(node, context)];
    },

};
