// Configuration shared by commands that use stores: `bench`, `show`, `remove`
export const STORE_CONFIG = {
  store: {},
  'store.use': {
    string: true,
    array: true,
    requiresArg: true,
    describe: `Module to save results.
Built-in stores: file, http.
Custom stores can be installed from npm.
Store-specific configuration properties can be specified using the same dot
notation such as --store.file.dir=path`,
  },
}
