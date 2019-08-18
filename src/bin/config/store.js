// Configuration shared by commands that use stores: `run`, `show`, `remove`
export const STORE_CONFIG = {
  store: {
    describe: `Module to save benchmarks.
Built-in stores: file.
Custom stores (installed with npm) can also be used.
Uses a dot notation such as --store.file (not --store=file nor --store file).
Store-specific options can be specified using the same dot notation such as
--store.file.dir`,
  },
}
