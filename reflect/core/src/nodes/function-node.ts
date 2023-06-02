import { getVisibilityModifier, isAbstract, isMember, isOptional, isReadOnly, isStatic } from '../utils/member.ts';
import type { FunctionLikeNode, NodeWithFunctionDeclaration, SymbolWithContext } from '../utils/is.ts';
import { isArrowFunction, isFunctionExpression } from '../utils/function.ts';
import type { FunctionDeclaration } from '../models/function.ts';
import { DeclarationKind } from '../models/declaration-kind.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import type { DeclarationNode } from './declaration-node.ts';
import { getLinePosition } from '../utils/get-location.ts';
import { getSymbolAtLocation } from '../utils/symbol.ts';
import { MemberKind } from '../models/member-kind.ts';
import { getDecorators } from '../utils/decorator.ts';
import { getNamespace } from '../utils/namespace.ts';
import { getModifiers } from '../utils/modifiers.ts';
import type { AnalyzerContext } from '../context.ts';
import { DecoratorNode } from './decorator-node.ts';
import { SignatureNode } from './signature-node.ts';
import { ModifierType } from '../models/member.ts';
import type { Method } from '../models/member.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class FunctionNode implements DeclarationNode<FunctionDeclaration | Method, NodeWithFunctionDeclaration> {

    private readonly _node: NodeWithFunctionDeclaration;

    private readonly _member: SymbolWithContext | undefined;

    private readonly _context: AnalyzerContext;

    constructor(node: NodeWithFunctionDeclaration, context: AnalyzerContext, member?: SymbolWithContext | undefined) {
        this._node = node;
        this._member = member;
        this._context = context;
    }

    getName(): string {
        if (
            ts.isFunctionDeclaration(this._node) ||
            ts.isMethodDeclaration(this._node) ||
            ts.isMethodSignature(this._node)
        ) {
            return this._node?.name?.getText() || '';
        }

        if (ts.isPropertyDeclaration(this._node) || ts.isPropertySignature(this._node)) {
            return this._node.name?.getText() || '';
        }

        if (ts.isVariableStatement(this._node)) {
            const declaration = this._node.declarationList.declarations.find(decl => {
                return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
            });

            return declaration?.name?.getText() || '';
        }

        return '';
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getKind(): MemberKind.Method | DeclarationKind.Function {
        return isMember(this._node) ? MemberKind.Method : DeclarationKind.Function;
    }

    getTSNode(): NodeWithFunctionDeclaration {
        return this._node;
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getNamespace(): string {
        return getNamespace(this._node);
    }

    getJSDoc(): JSDocNode | null {
        // Function/Method declarations have the JSDoc in the signature also.
        // We don't want to emit it twice in these cases.
        if (
            ts.isVariableStatement(this._node) ||
            ts.isPropertyDeclaration(this._node) ||
            ts.isPropertySignature(this._node)
        ) {
            return new JSDocNode(this._node);
        }

        return null;
    }

    getDecorators(): DecoratorNode[] {
        return getDecorators(this._node).map(d => new DecoratorNode(d, this._context));
    }

    getDecoratorWithName(name: string): DecoratorNode | null {
        return this.getDecorators().find(d => d.getName() === name) ?? null;
    }

    getSignatures(): SignatureNode[] {
        const func = this._getFunctionNode();
        const checker = this._context.checker;

        // For methods in classes or interfaces as we need the context
        // of the implementation (type parameters resolved). That's why we use
        // the type provided by the class/interface member.
        let funcType: ts.Type | null | undefined = this._member?.type;

        // When it's not a method or a property in a class or interface
        if (!funcType) {
            const symbol = func && getSymbolAtLocation(func, this._context.checker);
            funcType = func && symbol && checker?.getTypeOfSymbolAtLocation(symbol, func.getSourceFile());
        }

        // Anonymous functions
        if (!funcType) {
            const signature = func && checker?.getSignatureFromDeclaration(func);
            return signature ? [new SignatureNode(signature, this._context)] : [];
        }

        // It doesn't return the signature that has the implementation
        // of the method/function body when there is overloading.
        return funcType.getNonNullableType().getCallSignatures().map(signature => {
            return new SignatureNode(signature, this._context);
        });
    }

    getModifier(): ModifierType | null {
        if (!ts.isClassElement(this._node)) {
            return null;
        }

        return getVisibilityModifier(this._node);
    }

    isGenerator(): boolean {
        const func = this._getFunctionNode();

        return !!func && !ts.isMethodSignature(func) && !ts.isFunctionTypeNode(func) && !!func.asteriskToken;
    }

    isAsync(): boolean {
        const func = this._getFunctionNode();

        if (!func) {
            return false;
        }

        return getModifiers(func).some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);
    }

    isOptional(): boolean {
        return isOptional(this._member?.symbol);
    }

    isStatic(): boolean {
        return isStatic(this._node);
    }

    isReadOnly(): boolean {
        return isReadOnly(this._node);
    }

    isAbstract(): boolean {
        return isAbstract(this._node);
    }

    isInherited(): boolean {
        return !this._member?.overrides && !!this._member?.inherited;
    }

    overrides(): boolean {
        return !!this._member?.overrides;
    }

    serialize(): FunctionDeclaration | Method {
        const tmpl: FunctionDeclaration | Method = {
            name: this.getName(),
            kind: this.getKind(),
            signatures: this.getSignatures().map(signature => signature.serialize()),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc()?.serialize());
        tryAddProperty(tmpl, 'decorators', this.getDecorators().map(d => d.serialize()));
        tryAddProperty(tmpl, 'async', this.isAsync());
        tryAddProperty(tmpl, 'generator', this.isGenerator());

        tryAddProperty(tmpl as Method, 'static', this.isStatic());
        tryAddProperty(tmpl as Method, 'readOnly', this.isReadOnly());
        tryAddProperty(tmpl as Method, 'abstract', this.isAbstract());
        tryAddProperty(tmpl as Method, 'override', this.overrides());
        tryAddProperty(tmpl as Method, 'inherited', this.isInherited());
        tryAddProperty(tmpl as Method, 'optional', this.isOptional());

        return tmpl;
    }

    private _getFunctionNode(): FunctionLikeNode | null {
        let func: ts.Node | undefined | null = this._node;

        if (ts.isVariableStatement(this._node)) {
            const declaration = this._node.declarationList.declarations.find(decl => {
                return isArrowFunction(decl.initializer) || isFunctionExpression(decl.initializer);
            });

            func = declaration?.initializer;
        }

        if (ts.isPropertySignature(this._node)) {
            func = this._node.type?.kind === ts.SyntaxKind.FunctionType
                ? this._node.type as ts.FunctionTypeNode
                : null;
        }

        if (ts.isPropertyDeclaration(this._node)) {
            func = this._node.initializer;
        }

        if (
            func == null ||
            (
                !ts.isFunctionDeclaration(func) &&
                !ts.isArrowFunction(func) &&
                !ts.isFunctionExpression(func) &&
                !ts.isMethodSignature(func) &&
                !ts.isMethodDeclaration(func) &&
                !ts.isFunctionTypeNode(func)
            )
        ) {
            return null;
        }

        return func;
    }

}
