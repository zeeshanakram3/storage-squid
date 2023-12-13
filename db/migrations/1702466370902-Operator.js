module.exports = class Operator1702466370902 {
  name = 'Operator1702466370902'
  
  async up(db) {
    // Create pg_stat_statements extension for analyzing query stats
    await db.query(`CREATE EXTENSION pg_stat_statements;`)
  }
  
  async down(db) {
    await db.query(`DROP EXTENSION pg_stat_statements;`)
  }
}

