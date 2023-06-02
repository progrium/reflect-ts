import { getOriginalImportPath, matchesTsConfigPath, isBareModuleSpecifier } from '../utils/import.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Import } from '../models/import.ts';
import { ImportKind } from '../models/import.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


export class NamespaceImportNode implements ReflectedNode<Import, ts.ImportDeclaration> {

    private readonly _node: ts.ImportDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ImportDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getName(): string {
        const identifier = (this._node.importClause?.namedBindings as ts.NamespaceImport)?.name;

        return identifier?.escapedText ?? '';
    }

    getNodeType(): NodeType {
        return NodeType.Import;
    }

    getKind(): ImportKind {
        return ImportKind.Namespace;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    }

    getOriginalPath(): string {
        const identifier = (this._node.importClause?.namedBindings as ts.NamespaceImport)?.name;
        const importPath = this.getImportPath();

        return matchesTsConfigPath(importPath, this._context.compilerOptions)
            ? getOriginalImportPath(identifier, this._context)
            : importPath;
    }

    isTypeOnly(): boolean {
        return !!this._node?.importClause?.isTypeOnly;
    }

    isBareModuleSpecifier(): boolean {
        return isBareModuleSpecifier(this.getImportPath());
    }

    serialize(): Import {
        const originalPath = this.getOriginalPath();
        const tmpl: Import = {
            name: this.getName(),
            kind: this.getKind(),
            importPath: this.getImportPath(),
        };

        if (originalPath !== tmpl.importPath) {
            tmpl.originalPath = originalPath;
        }

        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'bareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }

}
