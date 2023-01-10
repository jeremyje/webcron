# Copyright 2023 Jeremy Edwards
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

BASE_VERSION = 0.0.0-dev
SHORT_SHA = $(shell git rev-parse --short=7 HEAD | tr -d [:punct:])
VERSION_SUFFIX = $(SHORT_SHA)
VERSION = $(BASE_VERSION)-$(VERSION_SUFFIX)
BUILD_DATE = $(shell date -u +'%Y-%m-%dT%H:%M:%SZ')
TAG := $(VERSION)
ALTERNATE_TAG := dev
REPOSITORY_ROOT := ${CURDIR}
TOOLCHAIN_DIR = $(REPOSITORY_ROOT)/build/toolchain
ARCHIVES_DIR = $(REPOSITORY_ROOT)/build/archives
NPM = $(TOOLCHAIN_DIR)/nodejs/bin/npm
REGISTRY = docker.io/jeremyje

NODEJS_VERSION = 14.17.3
export PATH := $(REPOSITORY_ROOT)/node_modules/.bin/:$(TOOLCHAIN_DIR)/nodejs/bin:$(PATH)


ifeq ($(OS),Windows_NT)
	NODEJS_PACKAGE = https://nodejs.org/dist/v$(NODEJS_VERSION)/node-v$(NODEJS_VERSION)-win-x64.zip
	NODEJS_PACKAGE_NAME = nodejs.zip
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		NODEJS_PACKAGE = https://nodejs.org/dist/v$(NODEJS_VERSION)/node-v$(NODEJS_VERSION)-linux-x64.tar.gz
		NODEJS_PACKAGE_NAME = nodejs.tar.gz
	endif
	ifeq ($(UNAME_S),Darwin)
		NODEJS_PACKAGE = https://nodejs.org/dist/v$(NODEJS_VERSION)/node-v$(NODEJS_VERSION)-darwin-x64.tar.gz
		NODEJS_PACKAGE_NAME = nodejs.tar.gz
	endif
endif

all: build build-images

presubmit: clean build test build-debian-image

build: dist/ binaries
binaries: webcron-alpine webcron-linux

webcron-alpine: dist/
	$(NPM) install pkg
	pkg . --targets=alpine

webcron-linux: dist/
	$(NPM) install pkg
	pkg . --targets=linux

dist/: node_modules/
	$(NPM) run build

test: node_modules/
	NODE_ENV=test $(NPM) run test

run: dist/
	$(NPM) run serve

node_modules/: build/toolchain/nodejs/
	-which node
	-which npm
	echo $(PATH)
	$(NPM) install --save
	$(NPM) install --only=dev

lint: node_modules/
	$(NPX) eslint .

push-images: push-debian-image push-alpine-image

push-debian-image: build-debian-image
	docker push $(REGISTRY)/webcron:$(TAG)
	docker push $(REGISTRY)/webcron:$(ALTERNATE_TAG)

push-alpine-image: build-alpine-image
	docker push $(REGISTRY)/webcron-alpine:$(TAG)
	docker push $(REGISTRY)/webcron-alpine:$(ALTERNATE_TAG)

build-images: build-debian-image build-alpine-image

build-debian-image:
	docker build -t $(REGISTRY)/webcron:$(TAG) -t $(REGISTRY)/webcron:$(ALTERNATE_TAG) -f docker-image/debian/Dockerfile --build-arg BUILD_DATE=$(BUILD_DATE) --build-arg VCS_REF=$(SHORT_SHA) --build-arg BUILD_VERSION=$(VERSION) .

build-alpine-image:
	docker build -t $(REGISTRY)/webcron:$(TAG)-alpine -t $(REGISTRY)/webcron:$(ALTERNATE_TAG)-alpine -f docker-image/alpine/Dockerfile --build-arg BUILD_DATE=$(BUILD_DATE) --build-arg VCS_REF=$(SHORT_SHA) --build-arg BUILD_VERSION=$(VERSION) .

clean: clean-images clean-build

clean-images: clean-debian-image clean-alpine-image

clean-debian-image:
	docker rmi -f $(REGISTRY)/webcron:$(TAG)
	docker rmi -f $(REGISTRY)/webcron:$(ALTERNATE_TAG)

clean-alpine-image:
	docker rmi -f $(REGISTRY)/webcron-alpine:$(TAG)
	docker rmi -f $(REGISTRY)/webcrona-alpine:$(ALTERNATE_TAG)

clean-build: clean-toolchain clean-archives clean-node
	rm -rf $(REPOSITORY_ROOT)/build/

clean-binaries:
	rm -f webcron-linux
	rm -f webcron-alpine
	rm -f webcron-macos
	rm -f webcron-win.exe

clean-toolchain:
	rm -rf $(TOOLCHAIN_DIR)

clean-archives:
	rm -rf $(ARCHIVES_DIR)

clean-dist:
	rm -rf $(REPOSITORY_ROOT)/dist/

clean-node: clean-dist clean-binaries
	rm -rf $(REPOSITORY_ROOT)/node_modules/
	rm -rf $(REPOSITORY_ROOT)/coverage/

run-image: build-debian-image
	docker run --name webcron --interactive --tty -p 18080:3000 webcron:$(TAG)

build/archives/$(NODEJS_PACKAGE_NAME):
	mkdir -p $(ARCHIVES_DIR)/
	cd $(ARCHIVES_DIR)/ && curl -L -o $(NODEJS_PACKAGE_NAME) $(NODEJS_PACKAGE)

build/toolchain/nodejs/: build/archives/$(NODEJS_PACKAGE_NAME)
	mkdir -p $(TOOLCHAIN_DIR)/nodejs/
ifeq ($(suffix $(NODEJS_PACKAGE_NAME)),.zip)
	# TODO: This is broken, there's the node-v10.15.3-win-x64 directory also windows does not have the bin/ directory.
	# https://superuser.com/questions/518347/equivalent-to-tars-strip-components-1-in-unzip
	cd $(TOOLCHAIN_DIR)/nodejs/ && unzip -q -o $(ARCHIVES_DIR)/$(NODEJS_PACKAGE_NAME)
else
	cd $(TOOLCHAIN_DIR)/nodejs/ && tar xzf $(ARCHIVES_DIR)/$(NODEJS_PACKAGE_NAME) --strip-components 1
	ls -la $(TOOLCHAIN_DIR)/nodejs/bin/
endif

.PHONY: all push-images push-debian-image push-alpine-image build-images build-debian-image build-alpine-image run-image clean clean-images clean-debian-image clean-alpine-image run build test
