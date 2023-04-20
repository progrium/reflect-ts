# reflect-ts

This repo is for exploring runtime reflection in TypeScript and includes use cases and packages that would expose and utilize this. The general approach is a fast parser that generates a schema representation for a subset of a TypeScript module's API/types as a JavaScript module that is used by a proper reflection API.

### Prior work

* [reflec-ts](https://github.com/pcan/reflec-ts) - Paused fork/wrapper for TypeScript compiler that adds Java/C# style reflection API.
* [tst-reflect](https://github.com/Hookyns/tst-reflect) - Possible usable(!) TypeScript compiler extension that also generates intermediate representation and C# style API.
* [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) - Not reflection, but similar idea of parsing TS symbols to generate JSON schema.
