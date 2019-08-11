// Load previous benchmark
export const load = async function(
  { queryType, queryValue },
  { dataDir, store: { get: getFromStore } },
) {
  try {
    const benchmark = await getFromStore(dataDir, queryType, queryValue)
    return benchmark
  } catch (error) {
    throw new Error(
      `Could not find benchmark from '${dataDir}':\n\n${error.stack}`,
    )
  }
}
