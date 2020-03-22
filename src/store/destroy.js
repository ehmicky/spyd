// Call `store.destroy()`
export const destroyStore = async function ({ store }) {
  try {
    return await store.destroy()
  } catch (error) {
    throw new Error(`Could not destroy store: ${error.message}`)
  }
}
