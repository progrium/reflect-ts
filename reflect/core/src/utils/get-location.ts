import { getAliasedSymbolIfNecessary, getSymbolAtLocation } from './symbol.ts';
import type { AnalyzerContext } from '../context.ts';
import type { SymbolWithLocation } from './is.ts';
import ts from 'npm:typescript@5.0.4';


export function getLocation(nodeOrType: ts.Node | ts.Type, context: AnalyzerContext): SymbolWithLocation {
    let symbol: ts.Symbol | undefined;

    if ('kind' in nodeOrType) {
        symbol = getAliasedSymbolIfNecessary(getSymbolAtLocation(nodeOrType, context.checker), context.checker);
    } else {
        symbol = nodeOrType.aliasSymbol ?? nodeOrType.getSymbol();
    }

    const decl = symbol?.getDeclarations()?.[0];
    const sourceFile = decl?.getSourceFile();
    const path = context.normalizePath(sourceFile?.fileName) ?? '';

    return {
        symbol,
        line: decl ? getLinePosition(decl) : null,
        path,
    };
}

export function getLinePosition(node: ts.Node): number {
    return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
}
