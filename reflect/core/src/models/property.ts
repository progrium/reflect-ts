import type { Decorator } from './decorator.ts';
import type { JSDoc } from './js-doc.ts';
import type { Type } from './type.ts';


export interface PropertyLike {
    name: string;
    line: number;
    type: Type;
    default?: unknown;
    optional?: boolean;
    decorators?: readonly Decorator[];
    jsDoc?: JSDoc;
}
