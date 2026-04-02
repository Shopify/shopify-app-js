COMPILE_DOCS="pnpm tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src  --declarationPath ../shopify-api/dist/ts --output ./docs/generated && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="pnpm tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages --declarationPath ../shopify-api/dist/ts --output ./docs/generated && rm -rf docs/staticPages/*.doc.js"
if [ "$1" = "isTest" ];
then
COMPILE_DOCS="pnpm tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src --declarationPath ../shopify-api/dist/ts --output ./docs/temp && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="pnpm tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages  --declarationPath ../shopify-api/dist/ts --output ./docs/temp && rm -rf docs/staticPages/*.doc.js"
fi

eval $COMPILE_DOCS
eval $COMPILE_STATIC_PAGES

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
