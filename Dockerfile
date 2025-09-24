### STAGE 1: Build ###

# We label our stage as 'builder'
FROM gplane/pnpm:10-node22-alpine as builder

WORKDIR /home/ng-app

# build argument BUILD_ENV (defaults to "test")
ARG BUILD_ENV=test
# expose it as an ENV
ENV BUILD_ENV=${BUILD_ENV}

RUN chown -R node:node /home/ng-app

USER node

COPY --chown=node:node package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN npm run build:${BUILD_ENV}


### STAGE 2: Setup ###

FROM devforth/spa-to-http:latest

COPY --from=builder /home/ng-app/dist/browser .

# Explicitly set the port the server will listen on
ENV PORT=80

# Expose the port for documentation and container orchestration tools
EXPOSE 80