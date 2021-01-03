import { STORE } from './groups.js'

// Configuration shared by commands that use stores: `bench`, `show`, `remove`
export const STORE_CONFIG = {
  stores: {
    group: STORE,
    string: true,
    array: true,
    requiresArg: true,
    describe: `Modules to save results.
Built-in stores: file, http.
Custom stores can be installed from npm.`,
  },
  store: {
    group: STORE,
    describe: `Store-specific configuration properties.
Uses a dot notation such as --store.file.dir=path`,
  },
}
