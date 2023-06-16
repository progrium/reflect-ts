# reflect module

The reflect module provides APIs for working with generated API schemas. It approximates two existing APIs:

### Experimental TypeScript Metadata API

Typescript (and Deno) has [experimental support for decorators](https://www.typescriptlang.org/docs/handbook/decorators.html). They also have experimental support for [reflection metadata](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata). They are related in that reflection metadata works by adding an extra decorator to any decorated symbol (currently only decorated classes, class fields, and methods are widely supported) that includes TypeScript type annotation data. 

This type reflection data is recorded by the decorator and later looked up by a proposed [Reflection Metadata API](https://github.com/rbuckton/reflect-metadata). 

Example:
```js
class C {
  @Reflect.metadata(metadataKey, metadataValue)
  method() {
  }
}

let obj = new C();
let metadataValue = Reflect.getMetadata(metadataKey, obj, "method");
```

The value of `metadataKey` is one of several known values. I know of `design:type` (class type data), `design:paramtypes` (function argument data). I don't recall the details of the returned data structure other than it was probably insufficient.

However, to make this system more widely useful in the long term, we should align with it as much as possible. It's not a current priority to implement the full API proposed, but implementing `getMetadata` would be a good stake in the ground.

### Go inspired reflect API

Several of the use cases involve porting Go code that is built around the Go [reflect package](https://pkg.go.dev/reflect). The most important API being the `Type` interface, which models the type of any Go value. The `Value` interface is less necessary in JavaScript, but a few methods may be useful. To start, implementing the `reflect.TypeOf()` method and the resulting `Type` interface value will get us pretty far. This would take a value with a known schema and return a `Type` backed by the schema data. It could even be the schema data structure.

The APIs don't have to be symbol to symbol identical, but most important is the `AssignableTo` method. This will check if a type can be assigned to another type. Most notably, if assigning to a value with an interface type, it checks if the given value implements that interface. Otherwise it's basically a straightforward check that the types match from the schemas. 


