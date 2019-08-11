import { STORES } from './stores/main.js'

// Find the stores according to the `store` and `data` options.
// Several stores can be used at once when saving, but only one when loading.
export const findStores = function() {
  return [STORES.file]
}
