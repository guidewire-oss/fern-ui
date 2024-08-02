#!/bin/sh

# Replace VITE_FERN_REPORTER_BASE_URL in the .env file with the value of the environment variable
sed -i "s|VITE_FERN_REPORTER_BASE_URL=.*|VITE_FERN_REPORTER_BASE_URL=${VITE_FERN_REPORTER_BASE_URL}|g" /app/refine/.env

# Build the application again since environment variables get embedded at build time rather than runtime
npm run build

# Execute the command passed to the container
exec "$@"