#bin/bash
./build.sh;

cd ../dist/dgt-shared-test;
yarn unlink @digita/dgt-shared-test
yarn link
cd ../dgt-shared-utils
yarn unlink @digita/dgt-shared-utils
yarn link
cd ../dgt-shared-data
yarn unlink @digita/dgt-shared-data
yarn link
cd ../dgt-shared-connectors
yarn unlink @digita/dgt-shared-connectors
yarn link
cd ../dgt-shared-web
yarn unlink @digita/dgt-shared-web
yarn link;
