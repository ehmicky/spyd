// Call `store.remove()`
export const remove = async function(
  group,
  benchmarks,
  { store: { remove: removeFromStore, opts } },
) {
  const ids = benchmarks
    .filter(benchmark => benchmark.group === group)
    .flatMap(getIds)

  try {
    await removeFromStore(ids, opts)
  } catch (error) {
    throw new Error(`Could not remove benchmark: ${error.message}`)
  }
}

const getIds = function({ ids }) {
  return ids
}
