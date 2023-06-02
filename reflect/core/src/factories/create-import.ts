import { isDefaultImport, isNamedImport, isNamespaceImport, isSideEffectImport } from '../utils/import.ts';
import { SideEffectImportNode } from '../nodes/side-effect-import-node.ts';
import { NamespaceImportNode } from '../nodes/namespace-import-node.ts';
import { DefaultImportNode } from '../nodes/default-import-node.ts';
import { NamedImportNode } from '../nodes/named-import-node.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Import } from '../models/import.ts';
import type { ImportNode } from '../utils/is.ts';
import ts from 'npm:typescript@5.0.4';


export const importFactory: NodeFactory<Import, ImportNode, ts.ImportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ImportDeclaration => ts.isImportDeclaration(node),

    create: (node: ts.ImportDeclaration, context: AnalyzerContext): ImportNode[] => {
        const result: ImportNode[] = [];

        if (isDefaultImport(node)) {
            result.push(new DefaultImportNode(node, context));
        }

        if (isSideEffectImport(node)) {
            result.push(new SideEffectImportNode(node, context));
        }

        if (isNamedImport(node)) {
            const elements = (node.importClause?.namedBindings as ts.NamedImports)?.elements ?? [];
            elements.forEach(el => result.push(new NamedImportNode(node, el, context)));
        }

        if (isNamespaceImport(node)) {
            result.push(new NamespaceImportNode(node, context));
        }

        return result;

    },

};
