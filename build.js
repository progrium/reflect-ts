const fs = require('fs');
const path = require('path');

const esbuild = require('esbuild');

//
// Helpers
//

const OS_CopyFile = (from, to) => {
    return fs.copyFileSync(from, to);
};

//
// Plugins
//

const nodeModules = new RegExp(/^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/);

const dirnamePlugin = {
  name: "dirname",
  setup(build) {
    build.onLoad({ filter: /.*/ }, ({ path: filePath }) => {
      if (!filePath.match(nodeModules)) {
        let contents = fs.readFileSync(filePath, "utf8");
        const loader = path.extname(filePath).substring(1);

        const filename = filePath.replaceAll('\\', '/');
        const dirname = path.dirname(filename);
        
        contents = contents
          .replaceAll("__dirname", `"${dirname}"`)
          .replaceAll("__filename", `"${filename}"`);

        return {
          contents,
          loader,
        };
      }
    });
  },
};

//
// Run
//

(async () => {

  let entry = path.resolve(__dirname, './examples/demo/demo.ts')
  if (process.argv[2])
  {
    entry = path.resolve(process.cwd(), process.argv[2]);
  }

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outdir: 'build',
    target: ['es2018'],
    plugins: [dirnamePlugin],
  });

  OS_CopyFile(path.resolve(__dirname, 'output.json'), path.resolve(__dirname, 'build/schema.json'));
  OS_CopyFile(path.resolve(__dirname, './examples/demo/index.html'), path.resolve(__dirname, 'build/index.html'));

  console.log('Done!');
})();
