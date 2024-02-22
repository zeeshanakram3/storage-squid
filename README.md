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

## Logging 

The storage-squid uses the `@subsquid/logger` package for logging. The logger is configured to log to `stderr` and the log level is determined by the `SQD_*` environment variables. 

By default, the log level for Storage Squid processor is set to `SQD_DEBUG=sqd:processor:mapping`. This means that all loggers will log at `DEBUG` level. So the processor logs will contain `DEBUG`, `INFO`, `WARN`, `ERROR` and `FATAL` logs (The integer values for these logging levels are `1`, `2`, `3`, `4` and `5` respectively).

However, sometimes it is very difficult to analyze the processor logs because of the high volume of DEBUG logs. So maybe you only want to see `INFO`, `WARN`, `ERROR` and `FATAL` logs. You can do this by using the `docker logs ...` command in the following way

```bash
# Only INFO logs
docker logs squid_processor 2>&1 | grep -E "\"level\":2" 

# INFO and above logs
docker logs squid_processor -f 2>&1 | grep -E "\"level\":2|\"level\":3|\"level\":4|\"level\":5" 

# You can also use other docker logs options like --follow, --tail etc
docker logs squid_processor --follow --tail 100 2>&1 | grep -E "\"level\":2|\"level\":3|\"level\":4|\"level\":5" 

# In case you only want to see the logs of a specific logger namespace e.g sqd:processor, you can use the following command.
docker logs squid_processor -f 2>&1 | grep -E "\"sqd:processor"\" 
```