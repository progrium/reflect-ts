import { resolveExpression } from '../utils/resolve-expression.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { Decorator } from '../models/decorator.ts';
import { getLocation } from '../utils/get-location.ts';
import type { AnalyzerContext } from '../context.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


export class DecoratorNode implements ReflectedNode<Decorator, ts.Decorator> {

    private readonly _decorator: ts.Decorator;

    private readonly _context: AnalyzerContext;

    constructor(decorator: ts.Decorator, context: AnalyzerContext) {
        this._decorator = decorator;
        this._context = context;
    }

    getName(): string {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return expr.escapedText ?? '';
        }

        if (ts.isCallExpression(expr)) {
            const identifier = expr.expression;

            if (ts.isIdentifier(identifier)) {
                return identifier.escapedText ?? '';
            }
        }

        return '';
    }

    getTSNode(): ts.Decorator {
        return this._decorator;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getArguments(): unknown[] {
        const expr = this._decorator.expression;

        if (ts.isCallExpression(expr)) {
            return expr.arguments.map(arg => resolveExpression(arg, this._context.checker));
        }

        return [];
    }

    getLine(): number | null {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return getLocation(expr, this._context).line;
        }

        if (ts.isCallExpression(expr)) {
            return getLocation(expr.expression, this._context).line;
        }

        return null;
    }

    hasArguments(): boolean {
        return !!this.getArguments().length;
    }

    getPath(): string {
        const expr = this._decorator.expression;

        if (ts.isIdentifier(expr)) {
            return getLocation(expr, this._context).path;
        }

        if (ts.isCallExpression(expr)) {
            return getLocation(expr.expression, this._context).path;
        }

        return '';
    }

    serialize(): Decorator {
        const path = this.getPath();
        const line = this.getLine();
        const tmpl: Decorator = {
            name: this.getName(),
        };

        if (line != null) {
            tmpl.source = {path, line};
        } else {
            tmpl.source = {path};
        }

        tryAddProperty(tmpl, 'arguments', this.getArguments());

        return tmpl;
    }

}
