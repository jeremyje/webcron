FROM debian:latest

RUN apt-get update \
  && apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
      libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
      libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
      libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
      libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
      libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev \
      build-essential curl \
  && rm -rf /var/cache/apk/*
RUN useradd --create-home --home-dir /home/webcron --shell /bin/bash webcron

RUN chown -R webcron /home/webcron

WORKDIR /home/webcron
USER webcron

# Docker Image Arguments
ARG BUILD_DATE
ARG VCS_REF
ARG BUILD_VERSION

COPY --chown=webcron:webcron . .
RUN make SHORT_SHA=${VCS_REF} clean-build
RUN make SHORT_SHA=${VCS_REF} build
RUN make SHORT_SHA=${VCS_REF} test

ENV PORT 3000
EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["serve"]

LABEL maintainer="Jeremy Edwards <jeremyje@gmail.com>" \
    version="3.0.0" \
    description="A server that will periodically download web content and store it in text, PDF, JPEG, and PNG format."

# Standardized Docker Image Labels
# https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL \
    org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.authors="Jeremy Edwards <jeremyje@gmail.com>" \
    org.opencontainers.image.url="https://github.com/jeremyje/webcron" \
    org.opencontainers.image.documentation="https://github.com/jeremyje/webcron/blob/master/README.md" \
    org.opencontainers.image.source="https://github.com/jeremyje/webcron.git" \
    org.opencontainers.image.version="${BUILD_VERSION}" \
    org.opencontainers.image.revision="2" \
    org.opencontainers.image.vendor="Jeremy Edwards" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.ref.name="" \
    org.opencontainers.image.title="${BUILD_DATE}" \
    org.opencontainers.image.description="A server that will periodically download web content and store it in text, PDF, JPEG, and PNG format." \
    org.label-schema.schema-version="1.0" \
    org.label-schema.build-date=$BUILD_DATE \
    org.label-schema.url="https://github.com/jeremyje/webcron" \
    org.label-schema.vcs-url="https://github.com/jeremyje/webcron.git" \
    org.label-schema.version=$BUILD_VERSION \
    org.label-schema.vcs-ref=$VCS_REF \
    org.label-schema.vendor="Jeremy Edwards" \
    org.label-schema.name="Webcron" \
    org.label-schema.description="A server that will periodically download web content and store it in text, PDF, JPEG, and PNG format." \
    org.label-schema.usage="https://github.com/jeremyje/webcron/blob/master/README.md" \
    org.label-schema.docker.cmd="docker run -d --name webcron --interactive --tty -p 18080:3000 webcron:latest" \
    org.label-schema.docker.debug="docker exec -it $CONTAINER npm run serve --help" \
    org.label-schema.docker.cmd.help="docker exec -it $CONTAINER npm run serve --help"
