ARG APP_PATH=/opt/outline
FROM node:20-alpine AS runner

ARG APP_PATH
WORKDIR $APP_PATH

COPY . .
ARG CDN_URL


RUN apk update && apk add --no-cache curl && apk add --no-cache ca-certificates

ENV NODE_ENV production


RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs $APP_PATH/build && \
  mkdir -p /var/lib/outline && \
	chown -R nodejs:nodejs /var/lib/outline

ENV FILE_STORAGE_LOCAL_ROOT_DIR /var/lib/outline/data
RUN mkdir -p "$FILE_STORAGE_LOCAL_ROOT_DIR" && \
  chown -R nodejs:nodejs "$FILE_STORAGE_LOCAL_ROOT_DIR" && \
  chmod 1777 "$FILE_STORAGE_LOCAL_ROOT_DIR"

VOLUME /var/lib/outline/data

USER nodejs


EXPOSE 3000
CMD ["yarn", "start"]