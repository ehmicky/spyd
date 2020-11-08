import { ALL_CONFIG } from '../config/all.js'
import { STORE_CONFIG } from '../config/store.js'

export const MIGRATE_COMMAND = {
  input: 'migrate',

  // Hidden command. Users should only use it when asked to do so by this tool
  // or by the changelog.
  description: false,

  config: { ...ALL_CONFIG, ...STORE_CONFIG },

  usage: `$0 [options] migrate

Migrate previous benchmarks.
This must sometimes be done when a new major release changes the benchmarks
internal format.`,

  examples: [['$0 migrate', 'Migrate previous benchmarks']],
}
