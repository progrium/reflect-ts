import { DeclarationKind } from './declaration-kind.ts';
import type { FunctionSignature } from './function.ts';
import type { Field, Method } from './member.ts';
import type { Decorator } from './decorator.ts';
import type { JSDoc } from './js-doc.ts';
import ts from 'npm:typescript@5.0.4';


export interface MixinNodes {
    function: ts.FunctionDeclaration | ts.VariableStatement;
    class: ts.ClassExpression | ts.ClassDeclaration;
}

export interface MixinDeclaration {
    name: string;
    kind: DeclarationKind.Mixin;
    signatures: readonly FunctionSignature[];
    namespace?: string;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
    properties?: readonly Field[];
    methods?: readonly Method[];
    constructors?: readonly FunctionSignature[];
}
