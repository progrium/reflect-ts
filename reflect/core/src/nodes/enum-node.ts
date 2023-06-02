import { DeclarationKind } from '../models/declaration-kind.ts';
import { tryAddProperty } from '../utils/try-add-property.ts';
import type { DeclarationNode } from './declaration-node.ts';
import { getLinePosition } from '../utils/get-location.ts';
import type { EnumDeclaration } from '../models/enum.ts';
import { EnumMemberNode } from './enum-member-node.ts';
import type { AnalyzerContext } from '../context.ts';
import { NodeType } from '../models/node.ts';
import { JSDocNode } from './jsdoc-node.ts';
import ts from 'npm:typescript@5.0.4';


export class EnumNode implements DeclarationNode<EnumDeclaration, ts.EnumDeclaration> {

    private readonly _node: ts.EnumDeclaration;

    private readonly _context: AnalyzerContext;

    constructor(node: ts.EnumDeclaration, context: AnalyzerContext) {
        this._node = node;
        this._context = context;
    }

    getNodeType(): NodeType {
        return NodeType.Declaration;
    }

    getKind(): DeclarationKind.Enum {
        return DeclarationKind.Enum;
    }

    getTSNode(): ts.EnumDeclaration {
        return this._node;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getName(): string {
        return this._node.name?.getText() ?? '';
    }

    getLine(): number {
        return getLinePosition(this._node);
    }

    getNamespace(): string {
        return (this._node.parent?.parent as ts.ModuleDeclaration)?.name?.getText() ?? '';
    }

    getJSDoc(): JSDocNode {
        return new JSDocNode(this._node);
    }

    getMembers(): EnumMemberNode[] {
        let defaultInitializer = 0;

        return this._node.members.map(member => {
            let value: string | number = member.initializer?.getText() ?? '';

            if (value !== '') {
                const possibleNumericValue = parseInt(value);

                if (!isNaN(possibleNumericValue)) {
                    defaultInitializer = possibleNumericValue + 1;
                    value = possibleNumericValue;
                }
            } else {
                value = defaultInitializer++;
            }

            return new EnumMemberNode(member, value, this._context);
        });
    }

    serialize(): EnumDeclaration {
        const tmpl: EnumDeclaration = {
            kind: this.getKind(),
            name: this.getName(),
            line: this.getLine(),
        };

        tryAddProperty(tmpl, 'namespace', this.getNamespace());
        tryAddProperty(tmpl, 'members', this.getMembers().map(member => member.serialize()));
        tryAddProperty(tmpl, 'jsDoc', this.getJSDoc().serialize());

        return tmpl;
    }

}
