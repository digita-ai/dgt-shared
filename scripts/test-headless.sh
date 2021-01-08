#!/bin/bash

./node_modules/.bin/ng test dgt-shared-utils --no-watch --no-progress --browsers=ChromeHeadlessCI
./node_modules/.bin/ng test dgt-shared-data --no-watch --no-progress --browsers=ChromeHeadlessCI
./node_modules/.bin/ng test dgt-shared-web --no-watch --no-progress --browsers=ChromeHeadlessCI
./node_modules/.bin/ng test dgt-shared-connectors --no-watch --no-progress --browsers=ChromeHeadlessCI
