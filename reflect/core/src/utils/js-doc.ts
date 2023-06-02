import type { JSDoc, JSDocTSComment, JSDocTSNode, JSDocTagValue } from '../models/js-doc.ts';
import type { Spec } from 'npm:comment-parser/primitives@1.3.1';
import { JSDocTagName } from '../models/js-doc.ts';
import { logWarning } from './logs.ts';
import { parse } from 'npm:comment-parser@1.3.1';


export function getAllJSDoc(node: JSDocTSNode): JSDoc {
    const doc: JSDoc = [];

    for (const jsDocComment of (node.jsDoc ?? [])) {
        collectJsDoc(jsDocComment, doc);
    }

    return doc;
}

function collectJsDoc(jsDocComment: JSDocTSComment, doc: JSDoc): void {
    const parsedJsDocComment = parse(jsDocComment.getFullText(), {spacing: 'preserve'}) ?? [];

    for (const block of parsedJsDocComment) {
        if (block.problems.length) {
            logWarning('There have been problems while parsing the JSDoc: ', block.problems);
        }

        const descriptionValue = trimNewLines(block.description ?? '');

        if (descriptionValue !== '') {
            doc.push({
                kind: JSDocTagName.description,
                value: descriptionValue,
            });
        }

        for (const tag of block.tags) {
            const name = tag.tag ?? '';

            if (name === JSDocTagName.typedef) {
                continue;
            }

            doc.push({
                kind: name,
                value: getJSTagValue(name, tag),
            });
        }
    }
}

function getJSTagValue(name: string, tag: Spec): JSDocTagValue {
    if (isBooleanJSDoc(name)) {
        return true;
    }

    if (isStringJSDoc(name)) {
        return trimNewLines(normalizeDescription(tag.description ? `${tag.name} ${tag.description}` : tag.name));
    }

    return getComplexJSTagValue(name, tag);
}

function getComplexJSTagValue(name: string, tag: Spec): JSDocTagValue {
    const result: JSDocTagValue = {};
    const defaultValue = tag.default ?? '';
    const descriptionValue = trimNewLines(normalizeDescription(tag.description ?? ''));
    const nameValue = tag.name ?? '';
    const typeValue = tag.type ?? '';
    const hasDefault = defaultValue !== '';
    const hasOptional = tag.optional;
    const hasType = typeValue !== '';

    if (hasDefault) {
        result.default = defaultValue;
    }

    if (hasOptional) {
        result.optional = true;
    }

    if (hasType) {
        result.type = typeValue;
    }

    if (name) {
        result.name = nameValue;
    }

    if (descriptionValue) {
        result.description = descriptionValue;
    }

    return result;
}

function isBooleanJSDoc(name: string): boolean {
    const booleanJSDocTags: string[] = [
        JSDocTagName.readonly,
        JSDocTagName.deprecated,
        JSDocTagName.override,
        JSDocTagName.public,
        JSDocTagName.protected,
        JSDocTagName.private,
        JSDocTagName.internal,
        JSDocTagName.ignore,
    ];

    return booleanJSDocTags.indexOf(name) !== -1;
}

function isStringJSDoc(name: string): boolean {
    const stringJSDocTags: string[] = [
        JSDocTagName.returns,
        JSDocTagName.type,
        JSDocTagName.summary,
        JSDocTagName.example,
        JSDocTagName.default,
        JSDocTagName.since,
        JSDocTagName.throws,
        JSDocTagName.category,
        JSDocTagName.see,
    ];

    return stringJSDocTags.indexOf(name) !== -1;
}

function trimNewLines(str = ''): string {
    return str.trim().replace(/^\s+|\s+$/g, '').trim();
}

function normalizeDescription(desc = ''): string {
    if (desc.startsWith('- ')) {
        return desc.slice(2);
    }

    return desc;
}