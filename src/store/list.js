// List previous benchmarks
export const list = async function({ dataDir, store: { list: listStore } }) {
  try {
    const benchmarks = await listStore(dataDir)
    return benchmarks
  } catch (error) {
    throw new Error(
      `Could not list previous benchmarks from '${dataDir}':\n${error.message}`,
    )
  }
}
