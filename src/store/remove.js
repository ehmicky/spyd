import { UserError } from '../error/main.js'

// Call `store.remove()`
export const removeFromStore = async function (
  mergeId,
  partialResults,
  { store },
) {
  const ids = partialResults
    .filter((partialResult) => partialResult.mergeId === mergeId)
    .map(getId)

  try {
    await store.remove(ids)
  } catch (error) {
    throw new UserError(`Could not remove result: ${error.message}`)
  }
}

const getId = function ({ id }) {
  return id
}
