// Migrate rawResult, i.e. modify it for backward compatibility
export const migrateRawResult = (rawResult) =>
  MIGRATIONS.reduce(runMigration, rawResult)

const runMigration = (rawResult, migration) => migration(rawResult)

// No backward compatibility migrations defined yet
const MIGRATIONS = []
