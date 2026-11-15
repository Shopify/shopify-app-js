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
    '4.0.0-rc.2',
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
    return {file, constant, version};
  });

  const run = () =>
    spawnSync(process.execPath, [script], {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: 5000,
    });
  return {files, run};
}

test('syncs all four constants from their manifests, including prereleases', (t) => {
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

test('fails without changing other constants when a declaration is missing', (t) => {
  const {files, run} = fixture(t);
  writeFileSync(
    files[3].file,
    "export const RENAMED_LIBRARY_VERSION = '1.0.0';\n",
  );

  const result = run();
  assert.equal(result.status, 1, result.stderr);
  assert.match(
    result.stderr,
    /Expected exactly one SHOPIFY_REMIX_LIBRARY_VERSION declaration/,
  );
  for (const {file, constant} of files.slice(0, 3)) {
    assert.equal(
      readFileSync(file, 'utf8'),
      `export const ${constant} = '1.0.0';\n`,
    );
  }
});
