FROM node:22-bookworm-slim@sha256:83fdfa2a4de32d7f8d79829ea259bd6a4821f8b2d123204ac467fbe3966450fc AS base
RUN apt update && apt install -y --no-install-recommends dumb-init
ENTRYPOINT ["dumb-init", "--"]

FROM node:22-bookworm@sha256:5145c882f9e32f07dd7593962045d97f221d57a1b609f5bf7a807eb89deff9d6 AS build
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci
COPY ./server ./server
COPY tsconfig.json .
RUN npm run build

FROM node:22-bookworm@sha256:5145c882f9e32f07dd7593962045d97f221d57a1b609f5bf7a807eb89deff9d6 AS install
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci --omit=dev

FROM base AS configure
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=install /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=install /usr/src/app/package.json ./package.json

FROM configure AS run
USER node
CMD npm run migration:up && npm run start
