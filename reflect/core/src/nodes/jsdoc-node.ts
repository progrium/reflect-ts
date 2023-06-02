import { JSDocValueNode } from './jsdoc-value-node.ts';
import { JSDocTagName } from '../models/js-doc.ts';
import type { JSDoc } from '../models/js-doc.ts';
import { getAllJSDoc } from '../utils/js-doc.ts';
import ts from 'npm:typescript@5.0.4';


export class JSDocNode {

    // There could be more than one JSDoc tag with the same name.
    // For example the `@param` tag can be used multiple times.
    private readonly _jsDoc: {[key: string]: JSDocValueNode[]} = {};

    constructor(node: ts.Node) {
        getAllJSDoc(node).forEach(tag => {
            if (this._jsDoc[tag.kind] === undefined) {
                this._jsDoc[tag.kind] = [];
            }

            this._jsDoc[tag.kind].push(new JSDocValueNode(tag.value));
        });
    }

    hasTag(name: string): boolean {
        return this._jsDoc[name] !== undefined;
    }

    /**
     * Returns the first JSDoc tag with the given name.
     *
     * @param name - The name of the JSDoc tag.
     *
     * @returns The first JSDoc tag with the given name or `undefined` if no such tag exists.
     */
    getTag(name: string): JSDocValueNode | undefined {
        return this._jsDoc[name]?.[0];
    }

    getAllTags(name: string): JSDocValueNode[] {
        return this._jsDoc[name] ?? [];
    }

    isIgnored(): boolean {
        return this.hasTag(JSDocTagName.ignore) ||
            this.hasTag(JSDocTagName.internal) ||
            this.hasTag(JSDocTagName.private);
    }

    serialize(): JSDoc {
        return Object.entries(this._jsDoc).flatMap(([kind, value]) => {
            return value.map(v => ({ kind, value: v.serialize() }));
        });
    }

}