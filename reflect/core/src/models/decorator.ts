import type { SourceReference } from './reference.ts';


export interface Decorator {
    name: string;
    arguments?: unknown[];
    source?: SourceReference;
}
