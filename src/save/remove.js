// Remove previous benchmark
export const remove = async function(
  { queryType, queryValue },
  { dataDir, store: { remove: removeFromStore } },
) {
  try {
    await removeFromStore(dataDir, queryType, queryValue)
  } catch (error) {
    throw new Error(
      `Could not remove benchmark from '${dataDir}':\n${error.message}`,
    )
  }
}
