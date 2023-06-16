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
export interface Logger {
  log(...args: any[]);
}
