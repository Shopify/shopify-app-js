COMPILE_DOCS="yarn tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src  --output ./docs/generated && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="yarn tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages --output ./docs/generated && rm -rf docs/staticPages/*.doc.js"

if [ "$1" = "isTest" ];
then
COMPILE_DOCS="yarn tsc --project docs/tsconfig.docs.json --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --overridePath ./docs/typeOverride.json --input ./src --output ./docs/temp && find . -name '*.doc.js' -delete"
COMPILE_STATIC_PAGES="yarn tsc docs/staticPages/*.doc.ts --types react --moduleResolution node  --target esNext  --module CommonJS && generate-docs --isLandingPage --input ./docs/staticPages  --output ./docs/temp && rm -rf docs/staticPages/*.doc.js"
fi

eval $COMPILE_DOCS
eval $COMPILE_STATIC_PAGES
