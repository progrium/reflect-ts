import { Component } from "../mithril.ts";
import { Node } from "./mod.ts";
import { Workbench } from "../shared.ts";

export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }

  beforeEditor(): Component {
    return {
      view({attrs}) {
        return m("div", {}, "Hello world"); // m is assumed to be a global
      }
    };
  }
}

export class Clock {
  startedAt?: Date;
  log: Date[][];
  showLog: boolean;

  component?: Node;
  object?: Node;

  constructor() {
    this.log = [];
    this.showLog = false;
  }

  afterEditor(): Component {
    return {
      view({attrs}) {
        return m("div", {}, "Hello world"); // m is assumed to be a global
      }
    };
  }

  belowEditor(): Component {
    return {
      view({attrs}) {
        return m("div", {}, "Hello world"); // m is assumed to be a global
      }
    };
  }

  static initialize(workbench: Workbench) {
    // ...
  }
}
