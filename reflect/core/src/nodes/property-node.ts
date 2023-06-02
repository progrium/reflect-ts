import { getVisibilityModifier, isAbstract, isOptional, isReadOnly, isStatic } from '../utils/member.ts';
import type { PropertyLikeNode, SymbolWithContext } from '../utils/is.ts';
import { resolveExpression } from '../utils/resolve-expression.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import { getLinePosition } from '../utils/get-location.ts';
import { getReturnStatement } from '../utils/function.ts';
import { getTypeFromTSType } from '../utils/get-type.ts';
import type { ReflectedNode } from './reflected-node.ts';
import { MemberKind } from '../models/member-kind.ts';
import { getDecorators } from '../utils/decorator.ts';
import type { AnalyzerContext } from '../context.ts';
import { DecoratorNode } from './decorator-node.ts';
import { JSDocTagName } from '../models/js-doc.ts';
import { ModifierType } from '../models/member.ts';
import type { Field } from '../models/member.ts';
import type { Type } from '../models/type.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class PropertyNode implements ReflectedNode<Field, PropertyLikeNode> {

    private readonly _node: PropertyLikeNode;

    private readonly _member: SymbolWithContext;

    private readonly _context: AnalyzerContext;

    constructor(node: PropertyLikeNode, member: SymbolWithContext, context: AnalyzerContext) {
        this._node = node;
        this._member = member;
        this._context = context;
    }

    getName(): string {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getter.name?.getText() ?? '';
        }

        if (setter) {
            return setter.name?.getText() ?? '';
        }

        return this._node.name.getText() ?? '';
    }

    getKind(): MemberKind.Property {
        return MemberKind.Property;
    }

    getTSNode(): PropertyLikeNode {
        return this._node;
    }

    getNodeType(): NodeType {
        return NodeType.Other;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getLine(): number {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getLinePosition(getter);
        }

        if (setter) {
            return getLinePosition(setter);
        }

        return getLinePosition(this._node);
    }

    getType(): Type {
        const jsDocType = this.getJSDoc().getTag(JSDocTagName.type)?.getValue<string>() ?? '';

        return jsDocType ? {text: jsDocType} : getTypeFromTSType(this._member.type, this._context);
    }

    getDefault(): unknown {
        const jsDocDefaultValue = this.getJSDoc().getTag(JSDocTagName.default)?.getValue<string>() ?? '';
        const [getter, setter] = this._getAccessors();

        if (jsDocDefaultValue) {
            return jsDocDefaultValue;
        }

        if (getter) {
            return resolveExpression(getReturnStatement(getter.body)?.expression, this._context.checker);
        }

        if (setter) {
            return undefined;
        }

        return resolveExpression((this._node as ts.PropertyDeclaration).initializer, this._context.checker);
    }

    getModifier(): ModifierType | null {
        if (!ts.isClassElement(this._node)) {
            return null;
        }

        return getVisibilityModifier(this._node);
    }

    getJSDoc(): JSDocNode {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return new JSDocNode(getter);
        }

        if (setter) {
            return new JSDocNode(setter);
        }

        return new JSDocNode(this._node);
    }

    getDecorators(): DecoratorNode[] {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return getDecorators(getter).map(d => new DecoratorNode(d, this._context));
        }

        if (setter) {
            return getDecorators(setter).map(d => new DecoratorNode(d, this._context));
        }

        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    isOptional(): boolean {
        return isOptional(this._member.symbol);
    }

    isStatic(): boolean {
        const [getter, setter] = this._getAccessors();

        if (getter) {
            return isStatic(getter);
        }

        if (setter) {
            return isStatic(setter);
        }

        return isStatic(this._node);
    }

    isReadOnly(): boolean {
        const readOnlyTag = !!this.getJSDoc().getTag(JSDocTagName.readonly)?.getValue<boolean>();
        const [getter, setter] = this._getAccessors();

        return readOnlyTag || (!!getter && !setter) || isReadOnly(this._node);
    }

    isWriteOnly(): boolean {
        const [getter, setter] = this._getAccessors();

        return !getter && !!setter;
    }

    isAbstract(): boolean {
        return isAbstract(this._node);
    }

    isInherited(): boolean {
        return !this._member.overrides && !!this._member.inherited;
    }

    overrides(): boolean {
        return !!this._member.overrides;
    }

    serialize(): Field {
        const tmpl: Field = {
            name: this.getName(),
            line: this.getLine(),
            kind: this.getKind(),
            type: this.getType(),
        };

        tryAddProperty(tmpl, 'optional', this.isOptional());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'default', this.getDefault());
        tryAddProperty(tmpl, 'static', this.isStatic());
        tryAddProperty(tmpl, 'readOnly', this.isReadOnly());
        tryAddProperty(tmpl, 'abstract', this.isAbstract());
        tryAddProperty(tmpl, 'override', this.overrides());
        tryAddProperty(tmpl, 'inherited', this.isInherited());
        tryAddProperty(tmpl, 'writeOnly', this.isWriteOnly());

        return tmpl;
    }

    private _getAccessors(): [ts.GetAccessorDeclaration | undefined, ts.SetAccessorDeclaration | undefined] {
        const decls = this._member.symbol?.getDeclarations() ?? [];
        const getter = decls.find(ts.isGetAccessor);
        const setter = decls.find(ts.isSetAccessor);

        return [getter, setter];
    }

}
