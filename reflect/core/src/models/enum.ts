import { DeclarationKind } from './declaration-kind.ts';
import type { JSDoc } from './js-doc.ts';


export interface EnumDeclaration {
    kind: DeclarationKind.Enum;
    name: string;
    line: number;
    members?: EnumMember[];
    jsDoc?: JSDoc;
    namespace?: string;
}

export interface EnumMember {
    name: string;
    value: string | number;
    jsDoc?: JSDoc;
}
