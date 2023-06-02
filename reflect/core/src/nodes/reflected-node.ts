import type { AnalyzerContext } from '../context.ts';
import { NodeType } from '../models/node.ts';
import ts from 'npm:typescript@5.0.4';


export interface ReflectedNode<Model extends object = object, T extends ts.Node | ts.Signature = ts.Node> {

    /**
     * The type of node. Can be an import, an export or a declaration
     */
    getNodeType(): NodeType;

    /**
     * Returns the original TS node
     */
    getTSNode(): T;

    /**
     * Returns the context in which the AST node was created.
     * The context contains useful utilities like the TS type checker.
     */
    getContext(): AnalyzerContext;

    /**
     * Returns a simple readonly JavaScript object without methods or internal state.
     */
    serialize(): Model;

}
