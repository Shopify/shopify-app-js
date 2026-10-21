import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';

const packages = [
  ['shopify-api', 'lib/version.ts', 'SHOPIFY_API_LIBRARY_VERSION', '15.0.2'],
  [
    'shopify-app-express',
    'src/version.ts',
    'SHOPIFY_EXPRESS_LIBRARY_VERSION',
    '8.0.4',
  ],
  [
    'shopify-app-react-router',
    'src/server/version.ts',
    'SHOPIFY_REACT_ROUTER_LIBRARY_VERSION',
    '4.0.0',
  ],
  [
    'shopify-app-remix',
    'src/server/version.ts',
    'SHOPIFY_REMIX_LIBRARY_VERSION',
    '6.0.3',
  ],
];

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'sync-version-constants-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  mkdirSync(join(root, 'scripts'));
  const script = join(root, 'scripts/sync-version-constants.mjs');
  copyFileSync(
    new URL('./sync-version-constants.mjs', import.meta.url),
    script,
  );

  const files = packages.map(([name, versionPath, constant, version]) => {
    const directory = join(root, 'packages/apps', name);
    const manifest = join(directory, 'package.json');
    const file = join(directory, versionPath);
    mkdirSync(join(file, '..'), {recursive: true});
    writeFileSync(manifest, JSON.stringify({name, version}));
    writeFileSync(file, `export const ${constant} = '1.0.0';\n`);
    return {manifest, file, constant, version};
  });

  const run = () =>
    spawnSync(process.execPath, [script], {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: 5000,
    });
  return {files, run};
}

test('syncs all four constants from their own package manifests', (t) => {
  const {files, run} = fixture(t);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  for (const {file, constant, version} of files) {
    assert.equal(
      readFileSync(file, 'utf8'),
      `export const ${constant} = '${version}';\n`,
    );
  }
});

test('does nothing when the constants already match', (t) => {
  const {run} = fixture(t);
  assert.equal(run().status, 0);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
});

test('preserves prerelease versions and surrounding content', (t) => {
  const {files, run} = fixture(t);
  const {manifest, file, constant} = files[2];
  writeFileSync(manifest, JSON.stringify({version: '4.0.0-rc.2'}));
  writeFileSync(
    file,
    `// Runtime library version\nexport const ${constant} = '3.0.2';\n`,
  );
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(file, 'utf8'),
    `// Runtime library version\nexport const ${constant} = '4.0.0-rc.2';\n`,
  );
});

for (const invalid of [
  'missing version',
  'missing declaration',
  'duplicate declaration',
  'missing file',
]) {
  test(`fails without changing other constants on ${invalid}`, (t) => {
    const {files, run} = fixture(t);
    const {manifest, file, constant} = files[3];
    if (invalid === 'missing version') {
      writeFileSync(manifest, '{}');
    } else if (invalid === 'missing declaration') {
      writeFileSync(file, '// Declaration was renamed\n');
    } else if (invalid === 'duplicate declaration') {
      writeFileSync(file, `export const ${constant} = '1.0.0';\n`.repeat(2));
    } else {
      rmSync(file);
    }

    const result = run();
    assert.equal(result.status, 1, result.stderr);
    for (const {file, constant} of files.slice(0, 3)) {
      assert.equal(
        readFileSync(file, 'utf8'),
        `export const ${constant} = '1.0.0';\n`,
      );
    }
  });
}
