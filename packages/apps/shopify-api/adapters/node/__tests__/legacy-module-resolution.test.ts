import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';

describe('legacy TypeScript module resolution', () => {
  it('resolves adapter imports to generated declarations', () => {
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
        path.resolve(__dirname, '../../..', 'package.json'),
        path.join(packageRoot, 'package.json'),
      );

      const declarationPath = path.join(
        packageRoot,
        'dist/ts/adapters/node/index.d.ts',
      );
      fs.mkdirSync(path.dirname(declarationPath), {recursive: true});
      fs.writeFileSync(
        declarationPath,
        'export declare const nodeAdapterInitialized: true;\n',
      );

      const consumerFile = path.join(projectRoot, 'index.ts');
      fs.writeFileSync(
        consumerFile,
        "import '@shopify/shopify-api/adapters/node';\n",
      );

      const result = ts.resolveModuleName(
        '@shopify/shopify-api/adapters/node',
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
  });
});
