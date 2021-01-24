import { STORE } from './groups.js'

// Configuration shared by commands that use stores: `bench`, `show`, `remove`
export const STORE_CONFIG = {
  store: {
    group: STORE,
    string: true,
    array: true,
    requiresArg: true,
    describe: `Module to save results.
Can be specified several times.
Built-in stores: file, http.
Custom stores can be installed from npm.
Store-specific configuration properties can be specified by appending the
store's name: --storeName.prop=value
For example: --storeFile.dir=path`,
  },
  since: {
    group: STORE,
    describe: `Which result to compare to when using the "limit" or "showDiff"
configuration properties.
For reporters showing all previous results, this also defines the first result.
Can be:
  - empty: last result
  - an integer: {integer}-th previous result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a result id
  - a git commit, tag or branch
  - "ci": last CI build
Default: the last CI build when in CI, or the last result otherwise.`,
  },
}
