#!/bin/bash

sudo apt-get update
sudo apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo docker run hello-world
docker rm -f webcron; docker run --name webcron --interactive --tty --publish 8181:3000 --volume $PWD/config.yaml:/home/webcron/config.yaml --volume $PWD/output:/tmp/output/news/ docker.io/jeremyje/webcron:v0.0.0-df10bb3 run serve -- --config=/home/webcron/config.yaml
