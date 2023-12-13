process: migrate
	@SQD_DEBUG=sqd:processor:mapping node -r dotenv-expand/config lib/processor.js

install:
	@rm -rf node_modules # clean up node_modules to avoid issues with patch-package
	@npm install

build:
	@npm run build

build-docker:
	@docker build . -t joystream/storage-squid

serve:
	@npx squid-graphql-server --subscriptions

migrate:
	@npx squid-typeorm-migration apply

dbgen:
	@npx squid-typeorm-migration generate

generate-migrations: 
	@rm db/migrations/*-Data.js || true
	@docker-compose down -v
	@docker network create joystream_default || true
	@docker-compose up -d squid_db
	@npx squid-typeorm-migration generate

codegen:
	@npm run generate:schema || true
	@npx squid-typeorm-codegen

typegen:
	@npx squid-substrate-typegen typegen.json

prepare: install typegen codegen build

up-squid:
	@docker network create joystream_default || true
	@docker-compose up -d

down-squid:
	@docker-compose down -v

.PHONY: build serve process migrate codegen typegen prepare up-squid down-squid
