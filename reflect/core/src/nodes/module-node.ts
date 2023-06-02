import { importFactory, declarationFactories, exportFactories } from '../factories/index.ts';
import { DeclarationKind } from '../models/declaration-kind.ts';
import type { ExportNode, ImportNode } from '../utils/is.ts';
import type { DeclarationNode } from './declaration-node.ts';
import type { ReflectedNode } from './reflected-node.ts';
import type { AnalyzerContext } from '../context.ts';
import { JSDocTagName } from '../models/js-doc.ts';
import type { Module } from '../models/module.ts';
import { NodeType } from '../models/node.ts';
import { is } from '../utils/is.ts';
import ts from 'npm:typescript@5.0.4';


export class ModuleNode implements ReflectedNode<Module, ts.SourceFile> {

    private readonly _node: ts.SourceFile;

    private readonly _imports: ImportNode[] = [];

    private readonly _context: AnalyzerContext;

    private _exports: ExportNode[] = [];

    private _declarations: DeclarationNode[] = [];

    constructor(node: ts.SourceFile, context: AnalyzerContext) {
        this._node = node;
        this._context = context;

        this._visitNode(node);

        this._removeDuplicatedExports();
        this._removeDuplicatedDeclarations();
        this._removeNonPublicDeclarations();
    }

    getTSNode(): ts.SourceFile {
        return this._node;
    }

    getPath(): string {
        return this._context.normalizePath(this._node.fileName);
    }

    getNodeType(): NodeType {
        return NodeType.Module;
    }

    getContext(): AnalyzerContext {
        return this._context;
    }

    getImports(): ImportNode[] {
        return this._imports;
    }

    getExports(): ExportNode[] {
        return this._exports;
    }

    getDeclarations(): DeclarationNode[] {
        return this._declarations;
    }

    getDeclarationByKind(kind: DeclarationKind): DeclarationNode[] {
        return this.getDeclarations().filter(decl => decl.getKind() === kind);
    }

    getDeclarationByName(name: string): DeclarationNode | null {
        return this.getDeclarations().find(decl => decl.getName() === name) ?? null;
    }

    getAllDeclarationsInNamespace(name: string): DeclarationNode[] {
        return this.getDeclarations().filter(decl => decl.getNamespace() === name);
    }

    getDeclarationsByCategory(category: string): DeclarationNode[] {
        return this.getDeclarations().filter(decl => {
            return decl.getJSDoc()?.getTag(JSDocTagName.category)?.getValue<string>() === category;
        });
    }

    serialize(): Module {
        return {
            path: this.getPath(),
            imports: this.getImports().map(imp => imp.serialize()),
            declarations: this.getDeclarations().map(dec => dec.serialize()),
            exports: this.getExports().map(exp => exp.serialize()),
        };
    }

    private _visitNode(rootNode: ts.Node | ts.SourceFile): void {
        let declarationFound = false;

        if (importFactory.isNode(rootNode)) {
            this._add(importFactory.create(rootNode, this._context));
        }

        for (const factory of declarationFactories) {
            if (factory.isNode(rootNode)) {
                this._add(factory.create(rootNode, this._context));
                declarationFound = true;
            }
        }

        for (const factory of exportFactories) {
            if (factory.isNode(rootNode)) {
                this._add(factory.create(rootNode, this._context));
            }
        }

        if (!declarationFound) {
            ts.forEachChild(rootNode, node => this._visitNode(node));
        }
    }

    private _add(reflectedNodes: ReflectedNode[]): void {
        for (const reflectedNode of reflectedNodes) {
            if (is.ImportNode(reflectedNode)) {
                this._imports.push(reflectedNode);
            }

            if (is.ExportNode(reflectedNode)) {
                this._exports.push(reflectedNode);
            }

            if (is.DeclarationNode(reflectedNode)) {
                this._declarations.push(reflectedNode);
            }
        }
    }

    private _removeNonPublicDeclarations(): void {
        this._declarations = this._declarations.filter(decl => {
            // If the export has an "AS" keyword, we need to use the "originalName"
            const index = this._exports.findIndex(exp => exp.getOriginalName() === decl.getName());
            const isIgnored = !!decl.getJSDoc()?.isIgnored();

            if (index === -1) {
                return false;
            }

            // Remove also the declaration from the exports array
            if (isIgnored) {
                this._exports.splice(index, 1);
            }

            return !isIgnored;
        });
    }

    private _removeDuplicatedExports(): void {
        this._exports = this._exports.filter((value, index, exports) => {
            return index === exports.findIndex(e => {
                return e.getName() === value.getName() && e.getKind() === value.getKind();
            });
        });
    }

    private _removeDuplicatedDeclarations(): void {
        this._declarations = this._declarations.filter((value, index, declarations) => {
            // If there is already a declaration that has been declared before with the same name
            // ignore the one that has been defined last.
            return !declarations.some((d, i) => d.getName() === value.getName() && i < index);
        });
    }

}
