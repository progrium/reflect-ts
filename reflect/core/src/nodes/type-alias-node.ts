import type { TypeAliasDeclaration } from '../models/type-alias.ts';
import { DeclarationKind } from '../models/declaration-kind.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import { TypeParameterNode } from './type-parameter-node.ts';
import { getLinePosition } from '../utils/get-location.ts';
import type { ReflectedNode } from './reflected-node.ts';
import { getNamespace } from '../utils/namespace.ts';
import type { AnalyzerContext } from '../context.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class TypeAliasNode implements ReflectedNode<TypeAliasDeclaration, ts.TypeAliasDeclaration> {

    private readonly _node: ts.TypeAliasDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.TypeAliasDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getTSNode(): ts.TypeAliasDeclaration {
        return this._node;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.TypeAlias {
        return DeclarationKind.TypeAlias;
    }

    getName(): string {
        return this._node.name?.getText() ?? '';
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getValue(): string {
        return this._node.type?.getText() ?? '';
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    serialize(): TypeAliasDeclaration {
        const tmpl: TypeAliasDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            value: this.getValue(),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));

        return tmpl;
    }

}
