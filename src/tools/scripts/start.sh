#!/bin/bash

node ../../dist/server/index.js  | pino-pretty -c -t &
find ../../dist/services -name index.js -exec sh -c 'node {}  | pino-pretty -c -t &' \;
