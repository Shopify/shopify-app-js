cd ~/src/github.com/Shopify/shopify-app-js

# clean shopify-api-js's build
# cd ../shopify-api-js/packages/shopify-api
# yarn token-exchange-clean
# cd ../../../shopify-app-js

# unlink local version of shopify-api-js (or true, it's ok if it wasn't linked before)
# yarn unlink "@shopify/shopify-api" || true

# reinstall dependencies (needs force after unlink)
yarn install --force

# unlink app-remix package
if [ -d "packages/shopify-app-remix/build/cjs" ]; then
  cd packages/shopify-app-remix/build/cjs
  yarn unlink || true
  cd ../../../../
fi

# unlink react, polaris and react run packages
cd node_modules/react
yarn unlink || true
cd ../@shopify/polaris
yarn unlink || true
cd ../../@remix-run/react
yarn unlink || true
cd ../../../

# clean build
yarn clean

# re-build shopify-api-js
# cd ../shopify-api-js/packages/shopify-api
# yarn token-exchange-build
# cd ../../../shopify-app-js

# re-link shopify-api-js
# yarn link "@shopify/shopify-api"

# rebuild
yarn build

# link shopify-app-remix from the build folder
cd packages/shopify-app-remix/build/cjs
yarn link
cd ../../../../

# link react, polaris and react run packages so that app uses a single version of them (they're direct app dependencies)
cd node_modules/react
yarn link
cd ../@shopify/polaris
yarn link
cd ../../@remix-run/react
yarn link
cd ../../../
