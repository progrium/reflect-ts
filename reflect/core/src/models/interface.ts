import type { TypeParameter } from './type-parameter.ts';
import { DeclarationKind } from './declaration-kind.ts';
import type { PropertyLike } from './property.ts';
import type { Field, Method } from './member.ts';
import type { Reference } from './reference.ts';
import { MemberKind } from './member-kind.ts';
import type { JSDoc } from './js-doc.ts';
import type { Type } from './type.ts';


export interface IndexSignature extends PropertyLike {
    kind: MemberKind.IndexSignature;
    indexType?: Type;
    readOnly?: boolean;
}

export interface InterfaceDeclaration {
    name: string;
    line: number;
    kind: DeclarationKind.Interface;
    properties?: readonly Field[];
    indexSignature?: IndexSignature;
    methods?: readonly Method[];
    jsDoc?: JSDoc;
    typeParameters?: readonly TypeParameter[];
    heritage?: readonly Reference[];
    namespace?: string;
}
