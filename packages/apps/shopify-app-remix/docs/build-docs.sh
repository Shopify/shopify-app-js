COMPILE_DOCS="pnpm tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src  --declarationPath ../shopify-api/dist/ts ../../../node_modules/@shopify/polaris/build/ts --output ./docs/generated && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="pnpm tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages --declarationPath ../shopify-api/dist/ts ../../../node_modules/@shopify/polaris/build/ts --output ./docs/generated && rm -rf docs/staticPages/*.doc.js"

if [ "$1" = "isTest" ];
then
COMPILE_DOCS="pnpm tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src --declarationPath ../shopify-api/dist/ts ../../../node_modules/@shopify/polaris/build/ts --output ./docs/temp && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="pnpm tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages  --declarationPath ../shopify-api/dist/ts ../../../node_modules/@shopify/polaris/build/ts --output ./docs/temp && rm -rf docs/staticPages/*.doc.js"
fi

eval $COMPILE_DOCS
eval $COMPILE_STATIC_PAGES
