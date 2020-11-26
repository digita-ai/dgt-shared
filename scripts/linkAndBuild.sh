#!/bin/bash

set -euxo pipefail;

./node_modules/.bin/ng build dgt-shared-test &&

cd dist/dgt-shared-test &&
yarn link &&
cd ../.. &&

cd projects/dgt-shared-utils &&
yarn link @digita-ai/dgt-shared-test &&
cd ../.. &&

./node_modules/.bin/ng build dgt-shared-utils &&
cd dist/dgt-shared-utils &&
yarn link &&
cd ../.. &&

cd projects/dgt-shared-data &&
yarn link @digita-ai/dgt-shared-test &&
yarn link @digita-ai/dgt-shared-utils &&
cd ../.. &&

./node_modules/.bin/ng build dgt-shared-data &&
cd dist/dgt-shared-data &&
yarn link &&
cd ../.. &&

cd projects/dgt-shared-web &&
yarn link @digita-ai/dgt-shared-test &&
yarn link @digita-ai/dgt-shared-utils &&
yarn link @digita-ai/dgt-shared-data &&
cd ../.. &&

./node_modules/.bin/ng build dgt-shared-web &&

cd projects/dgt-shared-connectors &&
yarn link @digita-ai/dgt-shared-test &&
yarn link @digita-ai/dgt-shared-utils &&
yarn link @digita-ai/dgt-shared-data &&
cd ../.. &&

./node_modules/.bin/ng build dgt-shared-connectors &&

cd dist/dgt-shared-web &&
yarn link &&
cd ../dgt-shared-connectors &&
yarn link &&
cd ../.. &&

yarn link @digita-ai/dgt-shared-utils &&
yarn link @digita-ai/dgt-shared-data;
