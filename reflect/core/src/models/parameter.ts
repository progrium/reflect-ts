import type { PropertyLike } from './property.ts';


export interface Parameter extends PropertyLike {
    rest?: boolean;
    named?: boolean;
    elements?: NamedParameterElement[];
}

export interface NamedParameterElement {
    name: string;
    default?: unknown;
}
