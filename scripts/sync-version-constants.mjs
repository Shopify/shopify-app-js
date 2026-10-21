import {readFileSync, writeFileSync} from 'node:fs';

const packages = [
  ['shopify-api', 'lib/version.ts', 'SHOPIFY_API_LIBRARY_VERSION'],
  ['shopify-app-express', 'src/version.ts', 'SHOPIFY_EXPRESS_LIBRARY_VERSION'],
  [
    'shopify-app-react-router',
    'src/server/version.ts',
    'SHOPIFY_REACT_ROUTER_LIBRARY_VERSION',
  ],
  [
    'shopify-app-remix',
    'src/server/version.ts',
    'SHOPIFY_REMIX_LIBRARY_VERSION',
  ],
];

// Read the manifests after Changesets has assigned the release versions.
// Validate every file before writing any updates.
const updates = packages.map(([name, versionPath, constant]) => {
  const directory = new URL(`../packages/apps/${name}/`, import.meta.url);
  const {version} = JSON.parse(
    readFileSync(new URL('package.json', directory), 'utf8'),
  );
  if (typeof version !== 'string' || !version) {
    throw new Error(`Missing package version for ${name}`);
  }

  const file = new URL(versionPath, directory);
  const current = readFileSync(file, 'utf8');
  const pattern = new RegExp(`export const ${constant} = '[^']+';`, 'g');
  if (current.match(pattern)?.length !== 1) {
    throw new Error(`Expected exactly one ${constant} declaration in ${file}`);
  }

  const updated = current.replace(
    pattern,
    () => `export const ${constant} = '${version}';`,
  );
  return {name, version, file, current, updated};
});

for (const {name, version, file, current, updated} of updates) {
  if (current !== updated) {
    writeFileSync(file, updated);
    console.log(`Updated ${name} runtime version to ${version}`);
  }
}
