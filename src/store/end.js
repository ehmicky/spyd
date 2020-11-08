import { UserError } from '../error/main.js'

// Call `store.end()`
export const endStore = async function ({ store }) {
  try {
    return await store.end()
  } catch (error) {
    throw new UserError(`Could not end store: ${error.message}`)
  }
}
