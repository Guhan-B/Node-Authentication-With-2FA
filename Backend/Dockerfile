# Build Stage
FROM node:lts AS build

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci --quite

COPY . .

RUN npx prisma generate && npm run build


# Deployment Stage
FROM node:lts-alpine AS production

USER node

ENV NODE_ENV production

WORKDIR /app

COPY --chown=node:node --from=build ["/app/package.json", "/app/package-lock.json", "./"]

RUN npm ci --omit=dev --quite

COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/prisma ./prisma

RUN npx prisma generate

CMD ["node", "build/index.js"]

EXPOSE 8000