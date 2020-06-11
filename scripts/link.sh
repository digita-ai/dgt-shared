#bin/bash
./build.sh;
cd ../dist/dgt-shared-test;
yarn link
cd ../dgt-shared-utils
yarn link
cd ../dgt-shared-data
yarn link
cd ../dgt-shared-connectors
yarn link
cd ../dgt-shared-web
yarn link;
