FROM --platform=${BUILDPLATFORM} node:18 AS base
WORKDIR /app/refine
COPY . .
RUN rm -rf node_modules # remove this due to incompatible architecture between arm and amd
RUN npm install
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "start"]