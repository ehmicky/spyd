// List previous benchmarks
export const list = async function({ store: { list: listStore, opts } }) {
  try {
    const benchmarks = await listStore(opts)
    return benchmarks
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
