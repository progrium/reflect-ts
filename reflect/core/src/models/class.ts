import type { TypeParameter } from './type-parameter.ts';
import { DeclarationKind } from './declaration-kind.ts';
import type { FunctionSignature } from './function.ts';
import type { Field, Method } from './member.ts';
import type { Reference } from './reference.ts';
import type { Decorator } from './decorator.ts';
import type { JSDoc } from './js-doc.ts';


export interface ClassDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Class;
    properties?: readonly Field[];
    staticProperties?: readonly Field[];
    methods?: readonly Method[];
    staticMethods?: readonly Method[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    decorators?: readonly Decorator[];
    constructors?: readonly FunctionSignature[];
    abstract?: boolean;
    namespace?: string;
    customElement?: boolean;
}
