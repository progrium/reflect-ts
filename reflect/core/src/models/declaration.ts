import type { TypeAliasDeclaration } from './type-alias.ts';
import type { InterfaceDeclaration } from './interface.ts';
import type { VariableDeclaration } from './variable.ts';
import type { FunctionDeclaration } from './function.ts';
import type { ClassDeclaration } from './class.ts';
import type { MixinDeclaration } from './mixin.ts';
import type { EnumDeclaration } from './enum.ts';


export type Declaration =
    | ClassDeclaration
    | InterfaceDeclaration
    | FunctionDeclaration
    | MixinDeclaration
    | VariableDeclaration
    | EnumDeclaration
    | TypeAliasDeclaration;
