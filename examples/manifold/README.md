# manifold use case

Manifold components in TypeScript are simply classes the same way they're simply structs in Go. However, Manifold components are expected to share their schema for use in automatically generating UI to interact with them. The schema format is in flux, but in general needs to include fields, their types, methods, their type signatures, and the definitions of any types referenced. 

A general schema format that works across languages is a future project. For now, the schemas produced by this system should satisfy our ealy TypeScript implementation of Manifold. This example will include several components expected to be able to get schemas for Manifold.