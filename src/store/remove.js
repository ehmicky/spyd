// Call `store.remove()`
export const remove = async function(
  group,
  rawBenchmarks,
  { store: { remove: removeFromStore, opts } },
) {
  const ids = rawBenchmarks
    .filter(benchmark => benchmark.group === group)
    .map(getId)

  try {
    await removeFromStore(ids, opts)
  } catch (error) {
    throw new Error(`Could not remove benchmark: ${error.message}`)
  }
}

const getId = function({ id }) {
  return id
}
