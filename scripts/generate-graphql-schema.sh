#!/usr/bin/env bash

set -e

SCRIPT_PATH="$(dirname "${BASH_SOURCE[0]}")"

# Go to project root
cd $SCRIPT_PATH/..

# Run graphql server and db instances on different ports then the default
# ones to avoid conflict in case the services are running on default ports.
export GQL_PORT=4353
export DB_PORT=23333

# Run postgres db
docker run -d --name temp_gql_schema_generation_db \
    -e POSTGRES_DB=squid \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    -v temp_gql_schema_generation_db_volume:/var/lib/postgresql/data \
    -v ./db/postgres.conf:/etc/postgresql/postgresql.conf \
    -p ${DB_PORT}:${DB_PORT} postgres:14 postgres -p ${DB_PORT} || true

# Start the squid-graphql-server in the background
npx squid-graphql-server &

# Wait for 5 seconds to allow the server to start
sleep 5

# Get the GraphQL schema and save it
./node_modules/get-graphql-schema/dist/index.js http://localhost:${GQL_PORT}/graphql >./generated/schema.graphql

# Find the PID of the squid-graphql-server
SERVER_PID=$(ps | grep 'squid-graphql-server' | grep -v grep | awk '{print $1}')

# Kill the server process
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID
fi

docker rm temp_gql_schema_generation_db -vf || true
docker volume rm temp_gql_schema_generation_db_volume || true
