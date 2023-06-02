import type { ReflectedNode } from '../nodes/reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import ts from 'npm:typescript@5.0.4';


export interface NodeFactory<Model extends object, Node extends ReflectedNode<Model>, TSNode extends ts.Node> {

    isNode(node: ts.Node): node is TSNode;

    create(node: ts.Node, context: AnalyzerContext): Node[];

}
