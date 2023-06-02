import type { FunctionLike } from './function.ts';
import type { PropertyLike } from './property.ts';
import { MemberKind } from './member-kind.ts';


export enum ModifierType {
    public = 'public',
    private = 'private',
    protected = 'protected',
}

export interface MemberLike {
    static?: boolean;
    readOnly?: boolean;
    optional?: boolean;
    abstract?: boolean;
    override?: boolean;
    inherited?: boolean;
}

export interface Field extends PropertyLike, MemberLike {
    kind: MemberKind.Property;
    writeOnly?: boolean;
}

export interface Method extends FunctionLike, MemberLike {
    kind: MemberKind.Method;
}
