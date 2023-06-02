import { ExportDeclarationNode } from '../nodes/export-declaration-node.ts';
import { SideEffectImportNode } from '../nodes/side-effect-import-node.ts';
import { ExportAssignmentNode } from '../nodes/export-assignment-node.ts';
import { NamespaceExportNode } from '../nodes/namespace-export-node.ts';
import { NamespaceImportNode } from '../nodes/namespace-import-node.ts';
import { DefaultImportNode } from '../nodes/default-import-node.ts';
import type { DeclarationNode } from '../nodes/declaration-node.ts';
import { DeclarationKind } from '../models/declaration-kind.ts';
import { NamedImportNode } from '../nodes/named-import-node.ts';
import { NamedExportNode } from '../nodes/named-export-node.ts';
import type { ReflectedNode } from '../nodes/reflected-node.ts';
import { TypeAliasNode } from '../nodes/type-alias-node.ts';
import { InterfaceNode } from '../nodes/interface-node.ts';
import { ReExportNode } from '../nodes/re-export-node.ts';
import { FunctionNode } from '../nodes/function-node.ts';
import { VariableNode } from '../nodes/variable-node.ts';
import { ClassNode } from '../nodes/class-node.ts';
import { ImportKind } from '../models/import.ts';
import { ExportKind } from '../models/export.ts';
import { EnumNode } from '../nodes/enum-node.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


export type ImportNode = DefaultImportNode | NamedImportNode | NamespaceImportNode | SideEffectImportNode;

export type ExportStatementNode = NamedExportNode | NamespaceExportNode | ReExportNode;

export type ExportNode = ExportDeclarationNode | ExportAssignmentNode | ExportStatementNode;

export type NodeWithFunctionDeclaration = ts.VariableStatement
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.PropertyDeclaration
    | ts.PropertySignature;

export type FunctionLikeNode = ts.FunctionDeclaration |
    ts.ArrowFunction |
    ts.MethodSignature |
    ts.FunctionExpression |
    ts.FunctionTypeNode |
    ts.MethodDeclaration;

export type PropertyLikeNode = ts.PropertyDeclaration | ts.PropertySignature | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration;

export type ClassLikeNode = ts.ClassDeclaration | ts.ClassExpression;

export type InterfaceOrClassDeclaration = ClassLikeNode | ts.InterfaceDeclaration;

export type SymbolWithLocation = {
    path: string;
    line: number | null;
    symbol: ts.Symbol | undefined;
};

export type SymbolWithDeclaration<T extends ts.Declaration = ts.Declaration> = {
    symbol: ts.Symbol;
    declaration: T;
};

export type SymbolWithContext = {
    symbol: ts.Symbol | undefined;
    type: ts.Type | undefined;
    overrides?: boolean;
    inherited?: boolean;
};


export const is = {

    // IMPORTS
    ImportNode: (node: ReflectedNode): node is ImportNode => {
        return node.getNodeType() === NodeType.Import;
    },

    DefaultImportNode: (node: ReflectedNode): node is DefaultImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Default;
    },

    NamedImportNode: (node: ReflectedNode): node is NamedImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Named;
    },

    NamespaceImportNode: (node: ReflectedNode): node is NamespaceImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.Namespace;
    },

    SideEffectImportNode: (node: ReflectedNode): node is SideEffectImportNode => {
        return is.ImportNode(node) && node.getKind() === ImportKind.SideEffect;
    },

    // DECLARATIONS
    DeclarationNode: (node: ReflectedNode): node is DeclarationNode => {
        return node.getNodeType() === NodeType.Declaration;
    },

    EnumNode: (node: ReflectedNode): node is EnumNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Enum;
    },

    VariableNode: (node: ReflectedNode): node is VariableNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Variable;
    },

    TypeAliasNode: (node: ReflectedNode): node is TypeAliasNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.TypeAlias;
    },

    FunctionNode: (node: ReflectedNode): node is FunctionNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Function;
    },

    ClassNode: (node: ReflectedNode): node is ClassNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Class;
    },

    InterfaceNode: (node: ReflectedNode): node is InterfaceNode => {
        return is.DeclarationNode(node) && node.getKind() === DeclarationKind.Interface;
    },

    // EXPORTS
    ExportNode: (node: ReflectedNode): node is ExportNode => {
        return node.getNodeType() === NodeType.Export;
    },

    DefaultExportNode: (node: ReflectedNode): node is ExportAssignmentNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Default;
    },

    NamedExportNode: (node: ReflectedNode): node is NamedExportNode | ExportDeclarationNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Named;
    },

    EqualExportNode: (node: ReflectedNode): node is ExportAssignmentNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Equals;
    },

    NamespaceExportNode: (node: ReflectedNode): node is NamespaceExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Namespace;
    },

    ReExportNode: (node: ReflectedNode): node is ReExportNode => {
        return is.ExportNode(node) && node.getKind() === ExportKind.Star;
    },

};