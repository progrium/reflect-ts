import { tryAddProperty } from '../utils/try-add-property.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Export } from '../models/export.ts';
import { ExportKind } from '../models/export.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


// CASE export * as bar from './foo.ts';
export class NamespaceExportNode implements ReflectedNode<Export, ts.ExportDeclaration> {

    private readonly _node: ts.ExportDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.ExportDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getName(): string {
        if (!this._node.exportClause || !ts.isNamespaceExport(this._node.exportClause)) {
            return '';
        }

        return this._node.exportClause.name?.escapedText ?? '';
    }

    getOriginalName(): string {
        return this.getName();
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getKind(): ExportKind {
        return ExportKind.Namespace;
    }

    getNodeType(): NodeType {
        return NodeType.Export;
    }

    getModule(): string {
        return this._node.moduleSpecifier?.getText() ?? '';
    }

    getTSNode(): ts.ExportDeclaration {
        return this._node;
    }

    isTypeOnly(): boolean {
        return this._node.isTypeOnly ?? false;
    }

    serialize(): Export {
        const tmpl: Export = {
            name: this.getName(),
            kind: this.getKind(),
        };

        tryAddProperty(tmpl, 'module', this.getModule());
        tryAddProperty(tmpl, 'typeOnly', this.isTypeOnly());

        return tmpl;
    }

}
