import type { Declaration } from './declaration.ts';
import type { Export } from './export.ts';
import type { Import } from './import.ts';


export interface Module {
    path: string;
    declarations: Declaration[];
    imports: Import[];
    exports: Export[];
}
