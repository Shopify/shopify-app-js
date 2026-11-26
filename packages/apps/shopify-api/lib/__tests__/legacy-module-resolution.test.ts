import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';

const packageRoot = path.resolve(__dirname, '../..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
);
const exportedPaths = Object.entries(packageJson.exports).flatMap(
  ([subpath, conditions]) => {
    const declaration = (conditions as {types: string}).types;
    if (!subpath.includes('*')) return [[subpath, declaration]];

    const directory = subpath.slice(0, subpath.indexOf('*'));
    return fs
      .readdirSync(path.join(packageRoot, directory), {withFileTypes: true})
      .filter(
        (entry) =>
          entry.isDirectory() &&
          fs.existsSync(
            path.join(packageRoot, directory, entry.name, 'index.ts'),
          ),
      )
      .map((entry) => [
        subpath.replace('*', entry.name),
        declaration.replace('*', entry.name),
      ]);
  },
);

describe('legacy TypeScript module resolution', () => {
  it.each(exportedPaths)(
    'resolves %s to generated declarations instead of source',
    (subpath, declaration) => {
      const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), 'shopify-api-types-'),
      );

      try {
        const packageRoot = path.join(
          projectRoot,
          'node_modules',
          '@shopify',
          'shopify-api',
        );
        fs.mkdirSync(packageRoot, {recursive: true});
        fs.copyFileSync(
          path.resolve(__dirname, '../..', 'package.json'),
          path.join(packageRoot, 'package.json'),
        );

        const declarationPath = path.join(packageRoot, declaration);
        fs.mkdirSync(path.dirname(declarationPath), {recursive: true});
        fs.writeFileSync(
          declarationPath,
          'export declare const generatedDeclaration: true;\n',
        );

        const sourcePath = path.join(
          packageRoot,
          subpath === '.' ? 'lib' : subpath,
          'index.ts',
        );
        fs.mkdirSync(path.dirname(sourcePath), {recursive: true});
        fs.writeFileSync(sourcePath, 'export const rawSource = true;\n');

        const moduleName = `@shopify/shopify-api${subpath.slice(1)}`;
        const consumerFile = path.join(projectRoot, 'index.ts');
        fs.writeFileSync(consumerFile, `import '${moduleName}';\n`);

        const result = ts.resolveModuleName(
          moduleName,
          consumerFile,
          {
            module: ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.Node10,
          },
          ts.sys,
        );

        expect(
          result.resolvedModule &&
            fs.realpathSync(result.resolvedModule.resolvedFileName),
        ).toBe(fs.realpathSync(declarationPath));
      } finally {
        fs.rmSync(projectRoot, {recursive: true, force: true});
      }
    },
  );
});
