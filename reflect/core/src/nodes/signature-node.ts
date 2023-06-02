import type { FunctionReturn, FunctionSignature } from '../models/function.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import { TypeParameterNode } from './type-parameter-node.ts';
import { getLinePosition } from '../utils/get-location.ts';
import { getTypeFromTSType } from '../utils/get-type.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import { ParameterNode } from './parameter-node.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class SignatureNode implements ReflectedNode<FunctionSignature, ts.Signature> {

    private readonly _node: ts.Signature;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.Signature, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getTSNode(): ts.Signature {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node.getDeclaration());
    }

    getPath(): string {
        return this._node.getDeclaration()?.getSourceFile()?.fileName ?? '';
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node.getDeclaration());
    }

    getReturnType(): FunctionReturn {
        const returnTypeOfSignature = this._context.checker.getReturnTypeOfSignature(this._node);

        return {
            type: getTypeFromTSType(returnTypeOfSignature, this._context),
        };
    }

    getTypeParameters(): TypeParameterNode[] {
        return this._node.getDeclaration().typeParameters?.map(tp => new TypeParameterNode(tp, this._context)) ?? [];
    }

    getParameters(): ParameterNode[] {
        const symbolParameters = this._node.parameters ?? [];
        const declarationParameters = this._node.getDeclaration().parameters ?? [];
        const result: ParameterNode[] = [];

        for (let index = 0; index < declarationParameters.length; index++) {
            const node = new ParameterNode(declarationParameters[index], symbolParameters[index], this._context);

            if (node.getJSDoc().isIgnored()) {
                continue;
            }

            result.push(node);
        }

        return result;
    }

    getParameterByName(name: string): ParameterNode | null {
        return this.getParameters().find(param => param.getName() === name) ?? null;
    }

    serialize(): FunctionSignature {
        const tmpl: FunctionSignature = {
            line: this.getLine(),
            return: this.getReturnType(),
        };

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'typeParameters', this.getTypeParameters().map(tp => tp.serialize()));
        tryAddProperty(tmpl, 'parameters', this.getParameters().map(param => param.serialize()));

        return tmpl;
    }

}
