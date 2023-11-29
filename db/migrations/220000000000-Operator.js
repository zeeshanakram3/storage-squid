module.exports = class Operator2300000000000 {
  name = 'Operator2300000000000'
  
  async up(db) {
    // Create pg_stat_statements extension for analyzing query stats
    await db.query(`CREATE EXTENSION pg_stat_statements;`)
  }
  
  async down(db) {
    await db.query(`DROP EXTENSION pg_stat_statements;`)
  }
}
