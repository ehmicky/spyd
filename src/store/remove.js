// Remove previous benchmark
export const remove = async function(
  id,
  { store: { remove: removeFromStore, opts } },
) {
  try {
    await removeFromStore(id, opts)
  } catch (error) {
    throw new Error(`Could not remove benchmark: ${error.message}`)
  }
}
