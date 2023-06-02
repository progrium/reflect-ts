import { Authenticator, SearchIndex, FileStore } from "./engine/backends.ts";
import { Component } from "./mithril.ts";

export interface Context {
  value(key: any): any;
  done(): Promise;
}

export interface Logger {
  log(...args: any[]);
}

export interface AfterEditorProvider {
  afterEditor(): Component;
}


export interface BelowEditorProvider {
  belowEditor(): Component;
}

export class Workbench {
  belowEditorExts: BelowEditorProvider[];
  afterEditorExts: AfterEditorProvider[];

  auth: Authenticator|null;
  index: SearchIndex;
  files: FileStore;
}

export class Path {

}