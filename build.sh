#!/bin/bash
docker rmi -f jeremyje/webcron:canary
docker rm -f webcron-canary
docker rmi -f jeremyje/webcron:canary-alpine
docker rm -f webcron-canary-alpine
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git show -s --format=%H)
docker build -t jeremyje/webcron:canary -f Dockerfile.debian --build-arg BUILD_DATE=$BUILD_DATE --build-arg VCS_REF=$VCS_REF .
# docker build -t jeremyje/webcron:canary-alpine -f Dockerfile.alpine --build-arg BUILD_DATE=$BUILD_DATE --build-arg VCS_REF=$VCS_REF .
