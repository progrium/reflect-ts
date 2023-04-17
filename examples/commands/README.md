# command use case

This use case applies to Treehouse, which has a command system used to back menus, shortcuts, and a command palette. Currently, this system is just registering objects with command metadata (id, title, etc) and an action property that is a function to perform the command.

```js
workbench.commands.registerCommand({
  id: "insert-child",
  title: "Insert Child",
  action: (ctx: Context, name: string = "", siblingIndex?: number) => {
    // ...
  }
});
```

This function can have any signature, though by convention the first argument is always a Context. Many commands don't take any more arguments, so they can be called via the command palette in the UI and executed without further input from the user. 

We want to support commands with arguments by automatically prompting for the arguments, potentially as autocomplete items if possible. This means we need type data, but we lose this at runtime. One solution is to add metadata to the command object that specifies the argument types, but this would be redundant. So we want to use the schema metadata system to get the TypeScript types of the command function.

Unfortunately, I can't think of a generalized way to support this lambda style function definition. How do you know what lambdas to generate a schema for? How do you identify it for lookup without a symbol? So to better work with our reflection system, I'm considering making commands into decorated methods, for example:

```js
class Workspace {
  // ...

  @command({title: "Insert Child", id: "insert-child"})
  insertChild(ctx: Context, name: string = "", siblingIndex?: number) {
    // ...
  }

  // ...
}
```

This approach has not yet been validated to satisfy the command system requirements, but probably will, and lets us more easily lookup the schema by a symbol string (`path/to/module.Workspace#insertChild` for example). The decorator can also contribute by putting this string on the function so that it can be passed to reflection APIs by value (`reflect.TypeOf(ws.insertChild)` or `Reflect.getMetadata("design:paramtypes", ws, "insertChild")`).

As the above API is worked out, an example program will be added here to run against the reflect system.