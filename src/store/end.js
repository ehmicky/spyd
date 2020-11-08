// Call `store.end()`
export const endStore = async function ({ store }) {
  try {
    return await store.end()
  } catch (error) {
    throw new Error(`Could not end store: ${error.message}`)
  }
}
