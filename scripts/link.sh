#bin/bash
cd ../projects/dgt-shared-test;
npm link;
cd ../dgt-shared-utils
npm link;
npm link ../dgt-shared-test;
cd ../dgt-shared-data;
npm link;
npm link ../dgt-shared-test;
cd ../dgt-shared-connectors;
npm link;
npm link ../dgt-shared-test;
cd ../dgt-shared-web;
npm link;
npm link ../dgt-shared-test;
cd ../../scripts;
./build.sh;
