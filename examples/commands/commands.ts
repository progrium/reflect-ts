import { Context, Path } from "../shared.ts";

export class Nodes {
  @command({title: "Insert Child", id: "insert-child"})
  insertChild(ctx: Context, name: string = "", siblingIndex?: number) {
    // ...
  }

  @command({title: "Insert Node", id: "insert-node"})
  insertNode(ctx: Context, name: string = "") {
    // ...
  }

  @command({title: "Close Panel", id: "close-panel"})
  closePanel(ctx: Context, panel?: Path) {
    // ...
  }
}