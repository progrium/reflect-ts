
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
}

export class Path {
  
}