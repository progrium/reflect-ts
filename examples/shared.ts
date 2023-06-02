
export interface Context {
  value(key: any): any;
  done(): Promise;
}

export interface Logger {
  log(...args: any[]);
}