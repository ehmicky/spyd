// Migrate rawResult, i.e. modify it for backward compatibility
export const migrateRawResult = function (rawResult) {
  return MIGRATIONS.reduce(runMigration, rawResult)
}

const runMigration = function (rawResult, migration) {
  return migration(rawResult)
}

// No backward compatibility migrations defined yet
const MIGRATIONS = []
