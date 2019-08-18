// Remove previous benchmark
export const remove = async function(
  job,
  { store: { remove: removeFromStore, opts } },
) {
  try {
    await removeFromStore(job, opts)
  } catch (error) {
    throw new Error(`Could not remove benchmark: ${error.message}`)
  }
}
