import { getOriginalImportPath, isBareModuleSpecifier, matchesTsConfigPath } from '../utils/import.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Import } from '../models/import.ts';
import { ImportKind } from '../models/import.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


export class NamedImportNode implements ReflectedNode<Import, ts.ImportDeclaration> {

    private readonly _node: ts.ImportDeclaration;

    private readonly _element: ts.ImportSpecifier;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ImportDeclaration, element: ts.ImportSpecifier, context: AnalyzerContext) {
        this._node = node;
        this._element = element;
        this._context = context;
    }

    getTSNode(): ts.ImportDeclaration {
        return this._node;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getName(): string {
        return this._element.name.escapedText ?? '';
    }

    getReferenceName(): string {
        return this._element.propertyName?.escapedText ?? this.getName();
    }

    getNodeType(): NodeType {
        return NodeType.Import;
    }

    getKind(): ImportKind {
        return ImportKind.Named;
    }

    getImportPath(): string {
        return (this._node.moduleSpecifier as ts.StringLiteral)?.text ?? '';
    }

    getOriginalPath(): string {
        const importPath = this.getImportPath();

        return matchesTsConfigPath(importPath, this._context.compilerOptions)
            ? getOriginalImportPath(this._element.name, this._context)
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
        const referenceName = this.getReferenceName();
        const tmpl: Import = {
            name: this.getName(),
            kind: this.getKind(),
            importPath: this.getImportPath(),
        };

        if (referenceName !== tmpl.name) {
            tmpl.referenceName = referenceName;
        }

        if (originalPath !== tmpl.importPath) {
            tmpl.originalPath = originalPath;
        }

        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'bareModuleSpecifier', this.isBareModuleSpecifier());

        return tmpl;
    }

}
