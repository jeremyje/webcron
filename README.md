# Webcron

[![Continuous Integration](https://github.com/jeremyje/webcron/actions/workflows/ci.yml/badge.svg)](https://github.com/jeremyje/webcron/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=popout-square)](https://github.com/jeremyje/webcron/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/release-pre/jeremyje/webcron.svg?style=popout-square)](https://github.com/jeremyje/webcron/releases)
![GitHub issues](https://img.shields.io/github/issues/jeremyje/webcron.svg?style=popout-square)

A server that will periodically download web content and store it in text, PDF, JPEG, and PNG format.

This service can be run via Docker container (recommended) or by npm.

## Running

```bash
# Docker (recommended)
docker run --name webcron --interactive --tty -p 18080:3000 webcron:canary

# Manually
npm run --config=config.yaml
```

## Development Notes

```bash
#Upgrade dependencies.
npm i npm-check-updates
ncu -u
npm install
```

## Configuration

```yaml
---
- name: "Websites"
  outputDirectory: "output/websites"
  format: ["txt", "pdf", "png", "jpg"]
  # https://crontab.guru/every-30-minutes
  schedule: "*/5 * * * *"
  browser:
    flags: []
    headless: true
    timeout: 60000
    tabs: 3
    width: 3840
    height: 2160
    # https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
    waitUntil: "domcontentloaded"
  urls:
    - https://twitter.com/search?q=news&src=typd&lang=en
    - https://www.youtube.com/feed/trending

```

> _Example configuration to download what's trending on Twitter and YouTube._

## Run with Docker and Custom Configuration

```bash

mkdir -p $HOME/webcron/output
# Places config.yaml in the output directory.
cp config.yaml $HOME/webcron/output/config.yaml
# NOTE: Don't change /home/webcron/output/config.yaml path. It is the mounted path of the file inside of the container. 
docker run --name webcron --interactive --tty --publish 8181:3000 --volume $HOME/webcron/output:/home/webcron/output jeremyje/webcron:canary serve -- --config=/home/webcron/output/config.yaml

# Run the container using a specific version of webcron.
docker rm -f webcron; docker run --name webcron --interactive --tty --publish 8181:3000 --volume $PWD/config.yaml:/home/webcron/config.yaml --volume $PWD/output:/tmp/output/news/ docker.io/jeremyje/webcron:v0.0.0-df10bb3 run serve -- --config=/home/webcron/config.yaml
```

## Example Production Configuration Using Docker and Systemd

### install.sh

```bash
#!/bin/bash

SERVICE_DIR=/etc/systemd/system/

chmod 644 *.service

InstallService() {
  service_file=$1
  chmod 644 ${service_file}
  sudo systemctl stop ${service_file}
  sudo systemctl disable ${service_file}
  sudo cp -f ${service_file} ${SERVICE_DIR}
  sudo systemctl enable ${service_file}
  sudo systemctl start ${service_file}
}

mkdir -p $HOME/webcron/output
cp -f $HOME/config.yaml $HOME/webcron/output/config.yaml

LOCAL_WORKSPACE=$HOME/webcron/output
CONTAINER_WORKSPACE=/home/webcron/output
DOCKER_IMAGE=jeremyje/webcron:canary
docker pull ${DOCKER_IMAGE}
docker rm webcron -f
docker create --name webcron --interactive --tty --publish 8181:3000 --volume ${LOCAL_WORKSPACE}:${CONTAINER_WORKSPACE} ${DOCKER_IMAGE} serve -- --config=${CONTAINER_WORKSPACE}/config.yaml
InstallService "webcron.service"
```

### webcron.service

```ini
[Unit]
Description=webcron
Requires=docker.service
After=docker.service

[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/docker start --attach webcron
ExecStop=/usr/bin/docker stop --time 2 webcron
Type=simple
User=jeremyje
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
```

### eslint

```bash
# Activate environment
export PATH=$PWD/build/toolchain/nodejs/bin/:$PWD/node_modules/.bin/:$PATH
# Install eslint
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript
npx eslint .

```

> _Based on https://typescript-eslint.io/getting-started/_
