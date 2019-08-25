// Call `store.list()`
export const list = async function({ store }) {
  try {
    return await store.list()
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
