module.exports = class Indexes2100000000000 {
  name = 'Indexes2100000000000'

  async up(db) {
    await db.query(`CREATE INDEX "events_type" ON "event" USING BTREE (("data"->>'isTypeOf'));`)
    await db.query(
      `CREATE INDEX "events_dataObjectId" ON "event" USING BTREE (("data"->>'dataObjectId'));`
    )
  }

  async down(db) {
    await db.query(`DROP INDEX "events_type";`)
    await db.query(`DROP INDEX "events_dataObjectId";`)
  }
}
