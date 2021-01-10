// Migrate results, i.e. modify them for backward compatibility
export const migrateResults = function (results) {
  return MIGRATIONS.reduce(runMigration, results)
}

const runMigration = function (results, migration) {
  return results.map((result) => migration(result))
}

// No backward compatibility migrations defined yet
const MIGRATIONS = []
