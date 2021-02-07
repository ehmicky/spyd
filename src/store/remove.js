import { removeResult } from './store.js'

// Call `store.remove()`
export const removeFromStore = async function ({ id }, { cwd }) {
  await removeResult(id, cwd)
}
