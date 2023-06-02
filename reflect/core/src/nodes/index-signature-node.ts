import { tryAddProperty } from '../utils/try-add-property.ts';
import type { IndexSignature } from '../models/interface.ts';
import { getLinePosition } from '../utils/get-location.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { SymbolWithContext } from '../utils/is.ts';
import { MemberKind } from '../models/member-kind.ts';
import type { AnalyzerContext } from '../context.ts';
import { ParameterNode } from './parameter-node.ts';
import { JSDocTagName } from '../models/js-doc.ts';
import type { Type } from '../models/type.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class IndexSignatureNode implements ReflectedNode<IndexSignature, ts.IndexSignatureDeclaration> {

    private readonly _node: ts.IndexSignatureDeclaration;

    private readonly _member: SymbolWithContext;

    private readonly _context: AnalyzerContext;

    private readonly _parameter: ParameterNode;

    constructor(node: ts.IndexSignatureDeclaration, member: SymbolWithContext, context: AnalyzerContext) {
        this._node = node;
        this._member = member;
        this._context = context;
        this._parameter = this._getParameter();
    }

    getName(): string {
        return this._parameter.getName();
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getKind(): MemberKind {
        return MemberKind.IndexSignature;
    }

    getTSNode(): ts.IndexSignatureDeclaration {
        return this._node;
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getTag(JSDocTagName.type)?.getValue<string>();

        return {
            text: jsDocType || this._node.type?.getText() || '',
        };
    }

    getIndexType(): Type {
        return this._parameter.getType();
    }

    isOptional(): boolean {
        return this._parameter.isOptional();
    }

    serialize(): IndexSignature {
        const tmpl: IndexSignature = {
            name: this.getName(),
            line: this.getLine(),
            kind: MemberKind.IndexSignature,
            indexType: this.getIndexType(),
            type: this.getType(),
        };

        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }

    private _getParameter(): ParameterNode {
        const callSignature = this._member.type?.getCallSignatures()?.[0];
        const nodeParameters = this._node.parameters ?? [];
        const symbolParameters = callSignature?.parameters ?? [];
        const nodeParam = nodeParameters[0];
        const symbolParam = symbolParameters[0] ?? null;

        return new ParameterNode(nodeParam, symbolParam, this._context);
    }

}
