// Call `store.remove()`
export const removeFromStore = async function(group, rawBenchmarks, { store }) {
  const ids = rawBenchmarks
    .filter(rawBenchmark => rawBenchmark.group === group)
    .map(getId)

  try {
    await store.remove(ids)
  } catch (error) {
    throw new Error(`Could not remove benchmark: ${error.message}`)
  }
}

const getId = function({ id }) {
  return id
}
