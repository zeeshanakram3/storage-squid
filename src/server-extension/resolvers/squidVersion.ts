import fs from 'fs'
import _ from 'lodash'
import pkgDir from 'pkg-dir'
import 'reflect-metadata'
import { Field, ObjectType, Query, Resolver } from 'type-graphql'

const pkgVersion = (): Promise<string> => {
  // Path to  package.json file
  const packageJsonPath = `${pkgDir.sync()}/package.json`

  // Read the package.json file synchronously
  const data = fs.readFileSync(packageJsonPath, 'utf8')

  // Parse the JSON data
  const packageJson = JSON.parse(data)

  return packageJson.version
}

const memoizedPkgVersion = _.memoize(pkgVersion)

@ObjectType()
export class SquidVersion {
  @Field(() => String, { nullable: false })
  version!: string
}

@Resolver()
export class SquidVersionResolver {
  @Query(() => SquidVersion)
  async squidVersion(): Promise<SquidVersion> {
    // Get package version
    const version = await memoizedPkgVersion()

    return { version }
  }
}
