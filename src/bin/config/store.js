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
  compare: {
    group: STORE,
    describe: `Which result to compare to when using the "limit" or "showDiff"
configuration properties.
Can be:
  - nothing: compare with the last result
  - integer: compare with the {integer}-th previous result
  - a date|time: compare with the last result before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-dd hh:mm:ss'.`,
  },
}
