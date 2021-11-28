// Migrate rawResults, i.e. modify them for backward compatibility
export const migrateRawResults = function (rawResults) {
  return MIGRATIONS.reduce(runMigration, rawResults)
}

const runMigration = function (rawResults, migration) {
  return rawResults.map((rawResult) => migration(rawResult))
}

// No backward compatibility migrations defined yet
const MIGRATIONS = []
