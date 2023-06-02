import { resolveExpression } from '../utils/resolve-expression.ts';
import type { VariableDeclaration } from '../models/variable.ts';
import { DeclarationKind } from '../models/declaration-kind.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import type { DeclarationNode } from './declaration-node.ts';
import { getLinePosition } from '../utils/get-location.ts';
import { getTypeFromNode } from '../utils/get-type.ts';
import { getDecorators } from '../utils/decorator.ts';
import { getNamespace } from '../utils/namespace.ts';
import type { AnalyzerContext } from '../context.ts';
import { DecoratorNode } from './decorator-node.ts';
import { JSDocTagName } from '../models/js-doc.ts';
import type { Type } from '../models/type.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class VariableNode implements DeclarationNode<VariableDeclaration, ts.VariableDeclaration> {

    private readonly _node: ts.VariableStatement;

    private readonly _declaration: ts.VariableDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.VariableStatement, declaration: ts.VariableDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._declaration = declaration;
        this._context = context;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getName(): string {
        return this._declaration.name.getText() ?? '';
    }

    getTSNode(): ts.VariableDeclaration {
        return this._declaration;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.Variable {
        return DeclarationKind.Variable;
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getTag(JSDocTagName.type)?.getValue<string>() ?? '';

        return jsDocType
            ? {text: jsDocType}
            : getTypeFromNode(this._declaration, this._context);
    }

    getDefault(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getTag(JSDocTagName.default)?.getValue<string>();

        return jsDocDefaultValue ?? resolveExpression(this._declaration.initializer, this._context.checker);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    hasDefault(): boolean {
        return this.getDefault() !== undefined;
    }

    serialize(): VariableDeclaration {
        const defaultValue = this.getDefault();
        const tmpl: VariableDeclaration = {
            name: this.getName(),
            kind: this.getKind(),
            line: this.getLine(),
            type: this.getType(),
        };

        if (defaultValue !== '') {
            tmpl.default = defaultValue;
        }

        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'namespace', this.getNamespace());

        return tmpl;
    }

}
