import ts from 'npm:typescript@5.0.4';


export const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
    experimentalDecorators: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    declaration: true,
    allowJs: true,
};
