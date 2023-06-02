import { ExportDeclarationNode } from '../nodes/export-declaration-node.ts';
import { ExportAssignmentNode } from '../nodes/export-assignment-node.ts';
import { NamespaceExportNode } from '../nodes/namespace-export-node.ts';
import { NamedExportNode } from '../nodes/named-export-node.ts';
import type { ExportStatementNode } from '../utils/is.ts';
import { ReExportNode } from '../nodes/re-export-node.ts';
import { hasExportKeyword } from '../utils/export.ts';
import type { NodeFactory } from './node-factory.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Export } from '../models/export.ts';
import ts from 'npm:typescript@5.0.4';


export const exportDeclarationFactory: NodeFactory<Export, ExportDeclarationNode, ts.Node> = {

    isNode: hasExportKeyword,

    create: (node: ts.Node, context: AnalyzerContext): ExportDeclarationNode[] => {
        const exports: ExportDeclarationNode[] = [];

        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                exports.push(new ExportDeclarationNode(node, context, declaration));
            }
        }

        if (
            ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isTypeAliasDeclaration(node)
        ) {
            exports.push(new ExportDeclarationNode(node, context));
        }

        return exports;
    },

};

export const exportAssignmentFactory: NodeFactory<Export, ExportAssignmentNode, ts.ExportAssignment> = {

    isNode: (node: ts.Node): node is ts.ExportAssignment => ts.isExportAssignment(node),

    create: (node: ts.ExportAssignment, context: AnalyzerContext): ExportAssignmentNode[] => {
        return [new ExportAssignmentNode(node, context)];
    },

};

export const exportStatementFactory: NodeFactory<Export, ExportStatementNode, ts.ExportDeclaration> = {

    isNode: (node: ts.Node): node is ts.ExportDeclaration => ts.isExportDeclaration(node),

    create: (node: ts.ExportDeclaration, context: AnalyzerContext): ExportStatementNode[] => {
        const isNamed = node.exportClause && ts.isNamedExports(node.exportClause);
        const isNamespaced = node.exportClause && ts.isNamespaceExport(node.exportClause);
        const isReexport = node?.moduleSpecifier !== undefined;
        const result: (NamedExportNode | NamespaceExportNode | ReExportNode)[] = [];

        if (isNamed) {
            for (const element of node.exportClause.elements) {
                result.push(new NamedExportNode(node, element, context));
            }
        } else if (isNamespaced) {
            result.push(new NamespaceExportNode(node, context));
        } else if (isReexport) {
            result.push(new ReExportNode(node, context));
        }

        return result;
    },

};
