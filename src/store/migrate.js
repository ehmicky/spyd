// Migrate partialResults, i.e. modify them for backward compatibility
export const migratePartialResults = function (partialResults) {
  return MIGRATIONS.reduce(runMigration, partialResults)
}

const runMigration = function (partialResults, migration) {
  return partialResults.map((partialResult) => migration(partialResult))
}

// No backward compatibility migrations defined yet
const MIGRATIONS = []
