import { getResolvedCompilerOptions } from './resolve-compiler-options.ts';
import { formatDiagnostics, logError, logWarning } from './utils/logs.ts';
import type { AnalyzerContext } from './context.ts';
import { ModuleNode } from './nodes/module-node.ts';
import * as path from 'node:path';
import process from 'node:process';
import ts from 'npm:typescript@5.0.4';


/**
 * Given an array of TypeScript file paths and some configurable options,
 * reflects a simplified version of the TypeScript Abstract Syntax Tree.
 *
 * @param files - An array of paths where the TypeScripts files are located
 * @param compilerOptions - Options to pass to the TypeScript compiler
 *
 * @returns The reflected TypeScript AST
 */
export function parseFromFiles(files: readonly string[], compilerOptions?: ts.CompilerOptions): ModuleNode[] {
    const modules: ModuleNode[] = [];
    const resolvedCompilerOptions = getResolvedCompilerOptions(compilerOptions);
    const program = ts.createProgram(files, resolvedCompilerOptions);
    const diagnostics = program.getSemanticDiagnostics();

    if (diagnostics.length) {
        logError('Error while analysing source files:', formatDiagnostics(diagnostics));
        return [];
    }

    const context: AnalyzerContext = {
        checker: program.getTypeChecker(),
        compilerOptions: resolvedCompilerOptions,
        normalizePath: filePath => filePath ? path.normalize(path.relative(process.cwd(), filePath)) : '',
    };

    for (const file of files) {
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            logWarning(`Unable to analyze file "${file}".`);
            continue;
        }

        modules.push(new ModuleNode(sourceFile, context));
    }

    return modules;
}
