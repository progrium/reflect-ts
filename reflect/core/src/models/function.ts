import type { TypeParameter } from './type-parameter.ts';
import { DeclarationKind } from './declaration-kind.ts';
import type { Parameter } from './parameter.ts';
import type { Decorator } from './decorator.ts';
import type { JSDoc } from './js-doc.ts';
import type { Type } from './type.ts';


export interface FunctionReturn {
    type: Type;
}

export interface FunctionSignature {
    line: number;
    parameters?: readonly Parameter[];
    typeParameters?: readonly TypeParameter[];
    return: FunctionReturn;
    jsDoc?: JSDoc;
}

export interface FunctionLike {
    name: string;
    signatures: readonly FunctionSignature[];
    namespace?: string;
    async?: boolean;
    generator?: boolean;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
}

export interface FunctionDeclaration extends FunctionLike {
    kind: DeclarationKind.Function;
}
