import { exportAssignmentFactory, exportDeclarationFactory, exportStatementFactory } from './create-export.ts';
import { typeAliasFactory } from './create-type-alias.ts';
import { interfaceFactory } from './create-interface.ts';
import { functionFactory } from './create-function.ts';
import { variableFactory } from './create-variable.ts';
import { importFactory } from './create-import.ts';
import { classFactory } from './create-class.ts';
import { enumFactory } from './create-enum.ts';


export const declarationFactories = [
    functionFactory,
    classFactory,
    variableFactory,
    enumFactory,
    typeAliasFactory,
    interfaceFactory,
];

export const exportFactories = [
    exportDeclarationFactory,
    exportAssignmentFactory,
    exportStatementFactory,
];

export { importFactory };
