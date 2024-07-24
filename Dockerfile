FROM --platform=${BUILDPLATFORM} node:18 AS base
WORKDIR /app/refine
COPY . .
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN rm -rf node_modules # remove this due to incompatible architecture between arm and amd
RUN npm install
RUN npm run build

EXPOSE 9091
# Set the entrypoint to the script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["npm", "run", "start", "--", "--port", "9091"]