import { UserError } from '../error/main.js'

// Call `store.remove()`
export const removeFromStore = async function (
  mergeId,
  rawBenchmarks,
  { store },
) {
  const ids = rawBenchmarks
    .filter((rawBenchmark) => rawBenchmark.mergeId === mergeId)
    .map(getId)

  try {
    await store.remove(ids)
  } catch (error) {
    throw new UserError(`Could not remove benchmark: ${error.message}`)
  }
}

const getId = function ({ id }) {
  return id
}
