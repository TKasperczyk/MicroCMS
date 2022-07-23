#!/bin/bash

ps -ef | grep -E "node .+dist.+index.js" | grep -v grep | awk '{print $2}' | xargs -r kill -9
