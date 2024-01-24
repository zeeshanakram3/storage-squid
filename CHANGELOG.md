# 1.4.2

- **FIX**: Bump Subsquid processor (`@subsquid/substrate-processor`) version to include fix for switching to RPC when processing unfinalized blocks.

# 1.4.1

- **FIX**: Install `bash` in Dockerfile, since it does not come pre-installed in `node:18-alpine` image.

# 1.4.0

- Created `SquidVersion` graphql entity schema and exposed query to fetch the current version of the storage squid package.

# 1.3.0

- Disables processing of Hot/Un-finalized blocks by the processor.
- Add `DataObjectDeletedEventData` event type.

# 1.2.0

- patched `@subsquid/openreader` to pass parameter values in 'queryConfig' object instead of passing as param to `pgClient.query` function.
- enabled enhanced Opentelemetry postgres query traces.

# 1.1.0

- remove unused dependencies from `package.json` file.
- add opentelemetry integration.
- adds `get-graphql-schema` npm command.
- **FIX**: convert `ipfsHash` to string.

# 1.0.0

- Initial release of `storage-squid` package.