
export interface Vnode {
  tag: String|Object;
  key?: String;
  attrs?: Object;
  children?: Array|String|Number|Boolean;
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


export interface Component {
  view(vnode: Vnode): Children | null | void;
}