#FROM node:10.16-alpine
FROM alpine:latest

# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      make

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN addgroup webcron
RUN adduser -S -G node -s /bin/bash -h /home/webcron webcron

RUN chown -R webcron /home/webcron

WORKDIR /home/webcron
USER webcron

COPY --chown=webcron:webcron . .
RUN make build
RUN make test

ENV PORT 3000
EXPOSE 3000

ENTRYPOINT ["npm"]
CMD ["run", "serve"]

# Docker Image Arguments
ARG BUILD_DATE
ARG VCS_REF
ARG BUILD_VERSION

LABEL maintainer="Jeremy Edwards <jeremyje@gmail.com>" \
    version="1.2.0" \
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
    org.opencontainers.image.revision="1" \
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
