// 1
//export type Foo = string;

// 2
//export type Bar = string | number;

// 3
//type Bar2 = string | number;
//export type Bar2;

// 4
//export type Bar = string & number;

// 5
/*
export interface Point {
  x: number;
  y: number;
}
*/

// 6
/*
export interface Printer {
  public label?: string;

  print(verbose: false): string;

  //foo: () => void;
}
*/

// 7
/*
export class Employee {
  salary: number;

  private life() {}
  public doWork() {}
}
*/

// 8
/*
export interface Context {
  value(key: any): any;
  done(): Promise<any>;
}
*/

// 9
/*
export function log(...args: any[]) {}

export function log2(label: string, ...args: any[]) {}
*/

// 10
/*
export interface Logger {
  log(...args: any[]);
}
*/

// 11
/*
export interface Vnode {
  tag: String|Object;
  key?: String;
  attrs?: Object;
  children?: Array<any>|String|Number|Boolean;
  text?: String|Number|Boolean;
  dom?: Element; // assume this isn't defined
  domSize?: Number;
  state?: Object;
  events?: Object;
  instance?: Object;
}

type Child = Vnode | string | number | boolean | null | undefined;
interface ChildArray extends Array<Children> { }
type Children = Child | ChildArray;
*/

// 12
/*
export type MyList = Array<string>;
export type MyOptionalList = Array<string> | null;
*/

// 13
//export type MyObject = Record<string, string>;

// 14
export type StringList = string[];