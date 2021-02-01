#!/bin/bash

set -euxo pipefail;

ng build dgt-shared-test &&

cd dist/dgt-shared-test &&
npm link &&

ng build dgt-shared-utils &&
cd ../../projects/dgt-shared-utils &&
npm link @digita-ai/dgt-shared-test &&
cd ../../dist/dgt-shared-utils &&
npm link &&

ng build dgt-shared-data &&
cd ../../projects/dgt-shared-data &&
npm link @digita-ai/dgt-shared-test &&
npm link @digita-ai/dgt-shared-utils &&
cd ../../dist/dgt-shared-data &&
npm link &&

ng build dgt-shared-web &&
cd ../../projects/dgt-shared-web &&
npm link @digita-ai/dgt-shared-test &&
npm link @digita-ai/dgt-shared-utils &&
npm link @digita-ai/dgt-shared-data &&
cd ../../dist/dgt-shared-web &&
npm link &&

ng build dgt-shared-connectors &&
cd ../../projects/dgt-shared-connectors &&
npm link @digita-ai/dgt-shared-test &&
npm link @digita-ai/dgt-shared-utils &&
npm link @digita-ai/dgt-shared-data &&
cd ../../dist/dgt-shared-connectors &&
npm link &&

cd ../.. &&
npm link @digita-ai/dgt-shared-utils &&
npm link @digita-ai/dgt-shared-data;
