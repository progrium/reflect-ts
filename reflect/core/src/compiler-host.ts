import ts from 'npm:typescript@5.0.4';


//
// We use it to fake the file system when working in a browser environment.
//
export function createCompilerHost(fileName: string, code: string): ts.CompilerHost {

    const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
    const files: { [key: string]: ts.SourceFile } = {
        [fileName]: sourceFile,
    };

    return {

        getSourceFile: (name: string): ts.SourceFile | undefined => {
            return files[name];
        },

        writeFile: (name: string, content: string): void => {
            files[name] = ts.createSourceFile(name, content, ts.ScriptTarget.Latest, true);
        },

        getDefaultLibFileName: () => 'lib.d.ts',

        useCaseSensitiveFileNames: () => false,

        getCanonicalFileName: filename => filename,

        getCurrentDirectory: () => '',

        getNewLine: () => '\n',

        getDirectories: () => [],

        fileExists: () => true,

        readFile: () => '',

    };

}