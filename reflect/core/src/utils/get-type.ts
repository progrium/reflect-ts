import type { Type, TypeReference } from '../models/type.ts';
import { tryAddProperty } from './try-add-property.ts';
import type { AnalyzerContext } from '../context.ts';
import { getLocation } from './get-location.ts';
import { isThirdParty } from './import.ts';
import ts from 'npm:typescript@5.0.4';


export function getTypeFromTSType(type: ts.Type | undefined, context: AnalyzerContext): Type {
    if (type) {
        const name = context.checker.typeToString(type) ?? '';
        const result: Type = {text: name};

        tryAddProperty(result, 'sources', getTypeReferences(type, context));

        return result;
    }

    return {text: ''};
}

export function getTypeReferences(type: ts.Type | undefined, context: AnalyzerContext): TypeReference[] {
    if (!type) {
        return [];
    }

    const checker = context.checker;
    const node = checker.typeToTypeNode(type, void 0, ts.NodeBuilderFlags.IgnoreErrors);

    let result: TypeReference[] = [];

    if (!node) {
        return [];
    }

    // CASE of => TypeX[]
    if (ts.isArrayTypeNode(node) && ts.isTypeReferenceNode(node.elementType)) {
        const elementType = getTypeReferences(checker.getTypeArguments(type as ts.TypeReference)?.[0], context);
        result = result.concat(elementType);
    }

    // CASE of an Intersection type => TypeX & TypeY
    else if (ts.isIntersectionTypeNode(node)) {
        const elementTypes = (type as ts.IntersectionType).types.flatMap(t => getTypeReferences(t, context));
        result = result.concat(elementTypes);
    }

    // CASE of a Union type => TypeX | TypeY
    else if (ts.isUnionTypeNode(node)) {
        const elementTypes = (type as ts.UnionType).types.flatMap(t => getTypeReferences(t, context));
        result = result.concat(elementTypes);
    }

    // CASE of => TypeX
    else if (ts.isTypeReferenceNode(node)) {
        const name = checker.typeToString(type) ?? '';
        const {path, line} = getLocation(type, context);

        if (line != null && path && !isThirdParty(path)) {
            result.push({text: name, path, line});
        }
    }

    return result;
}

export function getTypeFromNode(node: ts.Node, context: AnalyzerContext): Type {
    const type = getTSType(node, context.checker);

    return getTypeFromTSType(type, context);
}

export function getTSType(node: ts.Node, checker: ts.TypeChecker): ts.Type | undefined {
    const type = checker.getTypeAtLocation(node);

    // Don't generalize the type of declarations like "const x = [4, 5] as const"
    if (isExplicitTypeSet(node)) {
        return type;
    }

    // Don't use the inferred literal types like "const x = 4" gives "x: 4" instead of "x: number"
    return type && checker.getBaseTypeOfLiteralType(type);
}

export function isExplicitTypeSet(node: ts.Node): boolean {
    return ts.hasOnlyExpressionInitializer(node) && !!node.initializer &&
        (ts.isAsExpression(node.initializer) || ts.isTypeAssertionExpression(node));
}