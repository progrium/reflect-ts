
export interface RawNode {
  ID:         string;
	Name:       string;
	Value?:     any;
	Parent?:    string;
	Linked:     Record<string, string[]>;
	Attrs:      Record<string, string>;
}

export type WalkFunc = (node: Node) => boolean;
export type ObserverFunc = (node: Node) => void;


export interface Node {
  readonly id: string;
  readonly bus: Bus;
  readonly raw: RawNode;

  name: string;
  value: any; 
  parent: Node|null;
  refTo: Node|null;
  siblingIndex: number;

  readonly prevSibling: Node|null;
  readonly nextSibling: Node|null;
  readonly ancestors: Node[];
  readonly isDestroyed: boolean;
  readonly path: string;
  
  readonly children: Node[];
  readonly childCount: number;
  addChild(node: Node): void;
  removeChild(node: Node): void;

  readonly components: Node[];
  readonly componentCount: number;
  addComponent(obj: any): void;
  removeComponent(type: any): void;
  hasComponent(type: any): boolean;
  getComponent(type: any): any|null;
  // getComponentsInChildren
  // getComponentsInParents 
  
  getLinked(rel: string): Node[];
  addLinked(rel: string, node: Node): void;
  removeLinked(rel: string, node: Node): void;
  moveLinked(rel: string, node: Node, idx: number): void;

  getAttr(name: string): string;
  setAttr(name: string, value: string): void;

  find(path: string): Node|null;
  walk(fn: WalkFunc, opts?: WalkOptions): boolean;
  destroy(): void;
  changed(): void;

}


export interface Bus {
  import(nodes: RawNode[]): void;
  export(): RawNode[];
  make(name: string, value?: any): Node;
  destroy(node: Node): void;
  roots(): Node[];
  root(name?: string): Node|null;
  find(path:string): Node|null;
  walk(fn: WalkFunc, opts?: WalkOptions): void;
  observe(fn: ObserverFunc): void;
}