import type { TypeParameter } from '../models/type-parameter.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import { getTypeArgumentNames } from '../utils/heritage.ts';
import { getLinePosition } from '../utils/get-location.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


export class TypeParameterNode implements ReflectedNode<TypeParameter, ts.TypeParameterDeclaration> {

    private readonly _node: ts.TypeParameterDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.TypeParameterDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getName(): string {
        return this._node.name.getText() ?? '';
    }

    getTSNode(): ts.TypeParameterDeclaration {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getDefault(): string {
        return this._node.default?.getText() || '';
    }

    getConstraint(): string {
        if (!this._node.constraint) {
            return '';
        }

        return getTypeArgumentNames([this._node.constraint])[0];
    }

    hasDefault(): boolean {
        return !!this.getDefault();
    }

    serialize(): TypeParameter {
        const tmpl: TypeParameter = {
            name: this.getName(),
        };

        tryAddProperty(tmpl, 'default', this.getDefault());
        tryAddProperty(tmpl, 'constraint', this.getConstraint());

        return tmpl;
    }

}
