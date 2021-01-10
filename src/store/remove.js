import { UserError } from '../error/main.js'

// Call `store.remove()`
export const removeFromStore = async function (id, { store }) {
  try {
    await store.remove(id)
  } catch (error) {
    throw new UserError(`Could not remove result: ${error.message}`)
  }
}
