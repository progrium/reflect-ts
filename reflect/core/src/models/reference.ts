import { DeclarationKind } from './declaration-kind.ts';


export interface Reference {
    name: string;
    kind?: DeclarationKind;
    source?: SourceReference;
}

export interface SourceReference {
    line?: number;
    path?: string;
}
