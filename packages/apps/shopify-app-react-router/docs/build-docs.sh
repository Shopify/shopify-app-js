COMPILE_DOCS="pnpm tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src  --declarationPath ../shopify-api/dist/ts --output ./docs/generated && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="pnpm tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages --declarationPath ../shopify-api/dist/ts --output ./docs/generated && rm -rf docs/staticPages/*.doc.js"
if [ "$1" = "isTest" ];
then
COMPILE_DOCS="pnpm tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src --declarationPath ../shopify-api/dist/ts --output ./docs/temp && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="pnpm tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages  --declarationPath ../shopify-api/dist/ts --output ./docs/temp && rm -rf docs/staticPages/*.doc.js"
fi

eval $COMPILE_DOCS
eval $COMPILE_STATIC_PAGES

# Fix v2 output: when a declaration-path type overwrites a local @publicDocs type,
# restore the local version from the v1 generated docs
OUTPUT_DIR="./docs/generated"
if [ "$1" = "isTest" ]; then OUTPUT_DIR="./docs/temp"; fi
V2_FILE="$OUTPUT_DIR/generated_docs_data_v2.json"
V1_FILE="$OUTPUT_DIR/generated_docs_data.json"
if [ -f "$V2_FILE" ] && [ -f "$V1_FILE" ]; then
  node -e "
    const fs = require('fs');
    const v2 = JSON.parse(fs.readFileSync('$V2_FILE', 'utf8'));
    const v1 = JSON.parse(fs.readFileSync('$V1_FILE', 'utf8'));
    for (const [typeName, fileMap] of Object.entries(v2)) {
      const paths = Object.keys(fileMap);
      // If only declaration-path entries exist, check v1 for the local version
      if (paths.every(p => !p.startsWith('src/'))) {
        for (const entry of v1) {
          for (const def of (entry.definitions || [])) {
            const localType = def.typeDefinitions?.[typeName];
            if (localType && localType.filePath?.startsWith('src/')) {
              v2[typeName] = { [localType.filePath]: localType };
              break;
            }
          }
          if (v2[typeName] !== fileMap) break;
        }
      }
      // If both local and declaration-path entries exist, keep only local
      const updatedPaths = Object.keys(v2[typeName]);
      if (updatedPaths.length > 1) {
        const localPath = updatedPaths.find(p => p.startsWith('src/'));
        if (localPath) {
          v2[typeName] = { [localPath]: v2[typeName][localPath] };
        }
      }
    }
    fs.writeFileSync('$V2_FILE', JSON.stringify(v2, null, 2));
  "
fi


# Copy generated docs to shopify-dev in the world repo if available
MAJOR_VERSION=$(node -p "require('./package.json').version.split('.')[0]")
WORLD_DEST="$HOME/world/trees/root/src/areas/platforms/shopify-dev/db/data/docs/templated_apis/shopify_app_react_router/v${MAJOR_VERSION}"
if [ -d "$WORLD_DEST" ]; then
  for file in generated_docs_data.json generated_docs_data_v2.json generated_static_pages.json; do
    if [ -f "./docs/generated/$file" ]; then
      cp "./docs/generated/$file" "$WORLD_DEST/$file"
      echo "Copied $file to $WORLD_DEST"
    fi
  done
fi
