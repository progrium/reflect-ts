import { tryAddProperty } from '../utils/try-add-property.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Export } from '../models/export.ts';
import { ExportKind } from '../models/export.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


// CASE of "export { x, y as z };"
export class NamedExportNode implements ReflectedNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _element: ts.ExportSpecifier;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ExportDeclaration, element: ts.ExportSpecifier, context: AnalyzerContext) {
        this._node = node;
        this._element = element;
        this._context = context;
    }

    getName(): string {
        return this._element.name?.escapedText ?? '';
    }

    getOriginalName(): string {
        return this._element.propertyName?.escapedText || this.getName();
    }

    getKind(): ExportKind {
        return ExportKind.Named;
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    isTypeOnly(): boolean {
        return this._node.isTypeOnly ?? false;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isReexport(): boolean {
        return this.getOriginalName() !== this.getName();
    }

    serialize(): Export {
        const originalName = this.getOriginalName();
        const tmpl: Export = {
            name: this.getName(),
            kind: this.getKind(),
        };

        if (originalName !== tmpl.name) {
            tryAddProperty(tmpl, 'originalName', this.getOriginalName());
        }

        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());
        tryAddProperty(tmpl, 'module', this.getModule());

        return tmpl;
    }

}
