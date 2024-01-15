const fs = require('fs')
const path = require('path')

module.exports = class Operator2200000000000 {
  name = 'Operator2200000000000'

  async up(db) {
    // Path to your package.json file
    const packageJsonPath = path.join(__dirname, '../../package.json')

    // Read the package.json file synchronously
    const data = fs.readFileSync(packageJsonPath, 'utf8')

    // Parse the JSON data
    const packageJson = JSON.parse(data)

    await db.query(
      `INSERT INTO "squid_version" ("id", "version") 
       VALUES ('${packageJson.name}' ,'${packageJson.version}');`
    )

    // Create pg_stat_statements extension for analyzing query stats
    await db.query(`CREATE EXTENSION pg_stat_statements;`)
  }

  async down(db) {
    await db.query(`DROP EXTENSION pg_stat_statements;`)
  }
}
