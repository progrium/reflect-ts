import type { TypeParameter } from './type-parameter.ts';
import { DeclarationKind } from './declaration-kind.ts';
import type { JSDoc } from './js-doc.ts';


export interface TypeAliasDeclaration {
    kind: DeclarationKind.TypeAlias;
    name: string;
    line: number;
    value: string;
    typeParameters?: TypeParameter[];
    jsDoc?: JSDoc;
    namespace?: string;
}
