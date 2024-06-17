ARG APP_PATH=/opt/outline
FROM node:20-alpine AS runner

ARG APP_PATH
WORKDIR $APP_PATH
ENV NODE_ENV production

COPY ./build ./build
COPY ./server ./server
COPY ./public ./public
COPY ./.sequelizerc ./.sequelizerc
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json

# Create a non-root user compatible with Debian and BusyBox based images
RUN addgroup --gid 1001 nodejs && \
  adduser --uid 1001 --ingroup nodejs nodejs && \
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
