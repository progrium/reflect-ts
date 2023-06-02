import { isBrowser } from '../context.ts';
import ts from 'npm:typescript@5.0.4';
import process from 'node:process';
//import chalk from 'chalk';

// NOTE(nick): disabling chalk import
const chalk = {
    yellow: (x) => x,
    red: (x) => x,
    blue: (x) => x,
};

//
// The following functions are used to log messages to console
//

const LIB_PREFIX = '[TS AST PARSER]';


export function logWarning(message: string, payload?: unknown): void {
    console.log(chalk.yellow(`${LIB_PREFIX}: ${message}`));

    if (payload != null) {
        console.warn(payload);
    }
}

export function logError(message: string, payload?: unknown): void {
    console.log(chalk.red(`${LIB_PREFIX}: ${message}`));

    if (payload != null) {
        console.error(payload);
    }
}

export function logInfo(message: string): void {
    console.log(chalk.blue(`${LIB_PREFIX}: ${message}`));
}

export function formatDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
    const diagnosticsHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName(name: string): string {
            return name;
        },
        getCurrentDirectory(): string {
            if (isBrowser) {
                return '';
            }

            return process.cwd();
        },
        getNewLine(): string {
            return '\n';
        },
    };

    return ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticsHost);
}
