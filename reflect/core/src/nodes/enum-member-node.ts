import { tryAddProperty } from '../utils/try-add-property.ts';
import { getLinePosition } from '../utils/get-location.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import type { EnumMember } from '../models/enum.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class EnumMemberNode implements ReflectedNode<EnumMember, ts.EnumMember> {

    private readonly _node: ts.EnumMember;

    private readonly _value: string | number;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.EnumMember, value: string | number, context: AnalyzerContext) {
        this._node = node;
        this._value = value;
        this._context = context;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getValue(): string | number {
        return this._value;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getTSNode(): ts.EnumMember {
        return this._node;
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    serialize(): EnumMember {
        const tmpl: EnumMember = {
            name: this.getName(),
            value: this.getValue(),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }

}
