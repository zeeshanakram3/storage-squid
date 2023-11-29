# Storage-Squid

The Joystream Storage-Squid is a [Subsquid](https://docs.subsquid.io/) based project that indexes _Only_ content-directory and storage data from Joystream blockchain and serves it via GraphQL API.

## Project structure


* `assets/patches/` - Patched npm packages
* `db/migrations/` - Postgres database migrations
* `schema/` - GraphQL schema definitions
* `src/mappings/` - Runtime events mappings/handlers
* `src/model/` - TypeORM entity classes/models generated from Graphql schema
* `src/types/` - Generated TypeScript definitions for Substrate events, calls and storage
* `src/processor.ts` - Main entry point for the storage squid processor. It also maps the runtime events to respective handlers.
* `typegen.json` - Typegen configuration file. Used to generate TypeScript definitions for Substrate events

## Prerequisites

* node 16.x
* docker
* npm -- note that `yarn` package manager is not supported


## Starting the Storage-Squid

```bash
make prepare # install dependencies and build the project
make up-squid # start the storage-squid processor and the GraphQL server
```
