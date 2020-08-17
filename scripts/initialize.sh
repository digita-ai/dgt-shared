#!/bin/bash

set -euxo pipefail;

ng build dgt-shared-test &&

cd dist/dgt-shared-test &&
yarn link &&
cd ../.. &&

cd projects/dgt-shared-utils &&
yarn link @digita/dgt-shared-test &&
cd ../.. &&

ng build dgt-shared-utils &&
cd dist/dgt-shared-utils &&
yarn link &&
cd ../.. &&

cd projects/dgt-shared-data &&
yarn link @digita/dgt-shared-test &&
yarn link @digita/dgt-shared-utils &&
cd ../.. &&

ng build dgt-shared-data &&
cd dist/dgt-shared-data &&
yarn link &&
cd ../.. &&

cd projects/dgt-shared-web &&
yarn link @digita/dgt-shared-test &&
yarn link @digita/dgt-shared-utils &&
yarn link @digita/dgt-shared-data &&
cd ../.. &&

ng build dgt-shared-web &&

cd projects/dgt-shared-connectors &&
yarn link @digita/dgt-shared-test &&
yarn link @digita/dgt-shared-utils &&
yarn link @digita/dgt-shared-data &&
cd ../.. &&

ng build dgt-shared-connectors &&

cd projects/dgt-shared-venture &&
yarn link @digita/dgt-shared-test &&
yarn link @digita/dgt-shared-utils &&
yarn link @digita/dgt-shared-data &&
cd ../.. &&

ng build dgt-shared-venture &&

cd dist/dgt-shared-web &&
yarn link &&
cd ../dgt-shared-connectors &&
yarn link &&
cd ../dgt-shared-venture &&
yarn link &&
cd ../..;

