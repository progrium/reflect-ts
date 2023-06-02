import { DeclarationKind } from './declaration-kind.ts';
import type { PropertyLike } from './property.ts';


export interface VariableDeclaration extends PropertyLike {
    kind: DeclarationKind.Variable;
    namespace?: string;
}
