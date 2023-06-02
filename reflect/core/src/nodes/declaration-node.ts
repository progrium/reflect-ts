import { DeclarationKind } from '../models/declaration-kind.ts';
import type { Declaration } from '../models/declaration.ts';
import type { ReflectedNode } from './reflected-node.ts';
import { MemberKind } from '../models/member-kind.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


/**
 * A reflected node that represents a declaration.
 */
export interface DeclarationNode<Model extends object = Declaration, TSNode extends ts.Node | ts.Signature = ts.Node> extends ReflectedNode<Model, TSNode> {
    /**
     * Returns the name of the declaration.
     */
    getName(): string;

    /**
     * Returns the JSDoc comments attached to this declaration.
     */
    getJSDoc(): JSDocNode | null;

    /**
     * Returns the type of Node.
     */
    getKind(): DeclarationKind | MemberKind;

    /**
     * Returns the namespaces this declaration is inside.
     *
     * If no namespace is found, an empty string is returned.
     */
    getNamespace(): string;
}
