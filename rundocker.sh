#!/bin/bash
./build.sh
docker run --name webcron-canary --interactive --tty -p 18080:3000 webcron:canary
