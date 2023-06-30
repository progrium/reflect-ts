//
// NOTE(nick): stub for path extname because deno can't bundle the node:path module
//
const path__extname = (path) => {
  const slashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

  if (slashIndex >= 0)
  {
    const dotIndex = path.lastIndexOf('.', slashIndex);
    if (dotIndex >= 0 && slashIndex < dotIndex)
    {
      return path.slice(dotIndex, path.length);
    }
  }

  return path;
};

export class Type {
  constructor(obj) {
    Object.assign(this, obj);
  }
};

export class Field {
  constructor(obj) {
    Object.assign(this, obj);
  }
};

export class Argument {
  constructor(obj) {
    Object.assign(this, obj);
  }
};

export class Schema {
  Types = {};

  constructor(obj) {
    Object.assign(this, obj);
  }

  Exports = () => {
    return Object.values(this.Types).filter((it) => it.Visibility === 'exported');
  }

  All = () => {
    return Object.values(this.Types);
  };

  GetTypesByName = (name) => {
    return this.All().filter((it) => it.Name === name);
  };

  GetTypeByName = (name) => {
    return this.All().find((it) => it.Name === name);
  };

  TypeOf = (x) => {
    let result = null;
    if ((typeof x === 'object' && x !== null) || (typeof x === 'function'))
    {
      const fqn = x.prototype.__fqn || x.__fqn;
      if (typeof fqn === 'string')
      {
        result = this.Types[fqn] || null;

        if (!result)
        {
            // NOTE(nick): scan for partial file match
            let index = fqn.indexOf('/');
            while (index >= 0)
            {
                const partialFqn = fqn.slice(index, fqn.length);
                result = this.Types[partialFqn];
                if (result)
                {
                    break;
                }

                index = fqn.indexOf('/', index + 1);
            }
        }
      }
    }
    return result;
  }

  AssignableTo = (t, dest) => {
    if (!t || !dest) return false;
    if (t === dest) return true;
    if (dest.Kind === 'struct') {
      // TODO(nick): check if t fields overlap with dest fields (recursivley, if .Types)
    }
    return false;
  }
};

export const makeType = (obj = {}) => new Type({
  Name: '',
  PkgPath: '',
  Kind: 'null',

  // for Structs
  Fields: [],

  // for Classes
  Methods: [],
  Extends: [],

  // for Funcs
  IsVariadic: false,
  Ins: [],
  Outs: [],
  Self: null, // for Methods

  // for Maps
  Key: null,

  // for Arrays
  Len: 0,

  // for Array,Chan,Map,Pointer,Slice
  Elem: null,

  Types: [], // for Unions

  // for exports
  Visibility: '',

  ...obj,
});

export const makeField = (obj = {}) => new Field({
  Name: '',
  Type: null,
  Offset: 0,
  Anonymous: false,

  Optional: false,
  // for class members (fields and methods)
  Visibility: '',

  ...obj,
});

export const makeArgument = (obj = {}) => new Argument({
  Name: '',
  Type: null,
  ...obj,
});

export const makeSchema = (obj = {}) => new Schema({...obj});

// NOTE(nick): Normalize windows paths for consistency across platforms
export const normalizePath = (filePath) => {
  return filePath.replaceAll('\\', '/');
}

export const toFullyQualifiedName = (it) => {
  const pkgPath = normalizePath(it.PkgPath);

  const ext = path__extname(pkgPath);
  const prefix = ext.length > 0 ? pkgPath.slice(0, pkgPath.length - ext.length) : pkgPath;
  return it.Name.startsWith(prefix) ? it.Name : `${prefix}.${it.Name}`;
};

export const traverse = (node, fn, ctx = {}) => {
  fn(node, ctx);

  const parent = node;

  if (typeof node.All === 'function') {
    node.All().forEach((it, index) => traverse(it, fn, { parent, key: 'All', index }));
  }

  const traverseArray = (node, key) => {
    if (Array.isArray(node[key])) {
      node[key].forEach((it, index) => traverse(it, fn, { parent: node, key, index }));
    }
  }

  traverseArray(node, 'Types');
  traverseArray(node, 'Extends');
  traverseArray(node, 'Methods');
  traverseArray(node, 'Fields');
  traverseArray(node, 'Ins');
  traverseArray(node, 'Outs');

  if (node.Type) traverse(node.Type, fn, { parent: node, key: 'Type', index: -1 });
  if (node.Elem) traverse(node.Elem, fn, { parent: node, key: 'Elem', index: -1 });
  if (node.Key) traverse(node.Key, fn, { parent: node, key: 'Key', index: -1 });
  if (node.Self) traverse(node.Self, fn, { parent: node, key: 'Self', index: -1 });
};

