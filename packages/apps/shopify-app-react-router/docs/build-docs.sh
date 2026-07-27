#!/bin/bash
set -e

generate-docs \
  --input ./src \
  --declarationPath ../shopify-api/dist/ts \
  --output ./docs/generated

# Copy generated docs to shopify-dev in the world repo if available
MAJOR_VERSION=$(node -p "require('./package.json').version.split('.')[0]")
WORLD_DEST="$HOME/world/trees/root/src/areas/platforms/shopify-dev/db/data/docs/templated_apis/shopify_app_react_router/v${MAJOR_VERSION}"
if [ -d "$WORLD_DEST" ]; then
  if [ -f ./docs/generated/generated_docs_data_v2.json ]; then
    cp ./docs/generated/generated_docs_data_v2.json "$WORLD_DEST/generated_docs_data_v2.json"
    echo "Copied generated_docs_data_v2.json to $WORLD_DEST"
  fi
fi
