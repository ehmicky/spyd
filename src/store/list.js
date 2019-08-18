// Call `store.list()`
export const list = async function({ store: { list: listStore, opts } }) {
  try {
    return await listStore(opts)
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
