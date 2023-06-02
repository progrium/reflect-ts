import type { InterfaceDeclaration } from '../models/interface.ts';
import { getExtendClauseReferences } from '../utils/heritage.ts';
import { DeclarationKind } from '../models/declaration-kind.ts';
import { IndexSignatureNode } from './index-signature-node.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import { TypeParameterNode } from './type-parameter-node.ts';
import type { DeclarationNode } from './declaration-node.ts';
import { getLinePosition } from '../utils/get-location.ts';
import { getSymbolAtLocation } from '../utils/symbol.ts';
import { getInstanceMembers } from '../utils/member.ts';
import type { Reference } from '../models/reference.ts';
import type { SymbolWithContext } from '../utils/is.ts';
import { getNamespace } from '../utils/namespace.ts';
import type { AnalyzerContext } from '../context.ts';
import type { Method } from '../models/member.ts';
import { PropertyNode } from './property-node.ts';
import { FunctionNode } from './function-node.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class InterfaceNode implements DeclarationNode<InterfaceDeclaration, ts.InterfaceDeclaration> {

    private readonly _node: ts.InterfaceDeclaration;

    private readonly _context: AnalyzerContext;

    private readonly _members: SymbolWithContext[] = [];

    constructor(node: ts.InterfaceDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
        this._members = getInstanceMembers(this._node, this._context.checker);
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.Interface {
        return DeclarationKind.Interface;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getTSNode(): ts.InterfaceDeclaration {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getIndexSignature(): IndexSignatureNode | null {
        const checker = this._context.checker;
        const indexSymbol = getSymbolAtLocation(this._node, checker)?.members?.get('__index' as ts.__String);
        const decl = indexSymbol?.getDeclarations()?.[0];

        if (!decl || !ts.isIndexSignatureDeclaration(decl)) {
            return null;
        }

        const symbolWithContext: SymbolWithContext = {
            symbol: indexSymbol,
            type: checker.getTypeOfSymbolAtLocation(indexSymbol, this._node),
        };

        return new IndexSignatureNode(decl, symbolWithContext, this._context);
    }

    getProperties(): PropertyNode[] {
        const result: PropertyNode[] = [];

        for (const member of this._members) {
            const {symbol} = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isPropertyMethod = ts.isPropertySignature(decl) && decl.type && ts.isFunctionTypeNode(decl.type);

            if (
                (ts.isPropertySignature(decl) || ts.isGetAccessor(decl) || ts.isSetAccessor(decl)) &&
                !isPropertyMethod
            ) {
                result.push(new PropertyNode(decl, member, this._context));
            }
        }

        return result;
    }

    getPropertyWithName(name: string): PropertyNode | null {
        return this.getProperties().find(m => m.getName() === name) ?? null;
    }

    getMethods(): FunctionNode[] {
        const result: FunctionNode[] = [];

        for (const member of this._members) {
            const {symbol} = member;
            const decl = symbol?.getDeclarations()?.[0];

            if (!decl) {
                continue;
            }

            const isPropertyMethod = ts.isPropertySignature(decl) && decl.type && ts.isFunctionTypeNode(decl.type);

            if (ts.isMethodSignature(decl) || isPropertyMethod) {
                result.push(new FunctionNode(decl, this._context, member));
            }
        }

        return result;
    }

    getMethodWithName(name: string): FunctionNode | null {
        return this.getMethods().find(m => m.getName() === name) ?? null;
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getHeritage(): readonly Reference[] {
        return getExtendClauseReferences(this._node, this._context);
    }

    serialize(): InterfaceDeclaration {
        const tmpl: InterfaceDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'heritage', this.getHeritage());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'indexSignature', this.getIndexSignature()?.serialize());
        tryAddProperty(tmpl, 'properties', this.getProperties().map(p => p.serialize()));
        tryAddProperty(tmpl, 'methods', this.getMethods().map(m => m.serialize()) as Method[]);

        return tmpl;
    }

}
