FROM node:16.14.2-alpine3.15

ARG APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV NEXT_PUBLIC_APP_REVISION=${APP_REVISION}

RUN apk add curl jq
RUN npm install -g npm@7.11.2

WORKDIR /app

COPY src/*.json ./
RUN npm install

COPY src ./

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
