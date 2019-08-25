import { listStore } from '../list.js'

// Saved benchmarked have a major version. This allows the
// saved benchmark format to introduce breaking changes without users losing
// their previous benchmarks. A `migrate` command performs the migration.
// This is only incremented on major releases.
// Note that this is for the saved benchmarks format. The benchmarks passed
// to reporters have a different format. That format also does not introduce
// breaking changes unless a major release is done, since users might rely
// on that format as well. But no migration is needed then.
export const validateDataVersion = function(rawBenchmarks) {
  if (hasOldBenchmarks(rawBenchmarks)) {
    throw new Error(`Please run 'spyd migrate'.
The previous benchmarks must be upgraded to the latest version of spyd.`)
  }
}

// Migrate all previous benchmarks to the latest data version
export const migrateStore = async function(opts) {
  const rawBenchmarks = await listStore(opts)

  if (!hasOldBenchmarks(rawBenchmarks)) {
    throw new Error(
      'Previous benchmarks are already upgraded to the latest version of spyd.',
    )
  }

  const rawBenchmarksA = rawBenchmarks.map(migrateBenchmark)

  await replaceStore(rawBenchmarksA, opts)
}

const hasOldBenchmarks = function(rawBenchmarks) {
  return rawBenchmarks.some(isOldBenchmark)
}

const isOldBenchmark = function({ version }) {
  return version < DATA_VERSION
}

// Current data version
export const DATA_VERSION = 3

// Perform each migration for each data version, one by one
const migrateBenchmark = function({ version, ...rawBenchmark }) {
  const rawBenchmarkA = MIGRATIONS.slice(version).reduce(
    reduceBenchmark,
    rawBenchmark,
  )
  return { ...rawBenchmarkA, version: DATA_VERSION }
}

const reduceBenchmark = function(rawBenchmark, migration) {
  return migration(rawBenchmark)
}

// Each entry is a migration function from one data version to the next one
const MIGRATIONS = []

const replaceStore = async function(rawBenchmarks, { store }) {
  try {
    await store.replace(rawBenchmarks)
  } catch (error) {
    throw new Error(`Could not migrate previous benchmarks: ${error.message}`)
  }
}
