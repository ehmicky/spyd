import { add } from './file/main.js'

// Save benchmark results so they can be compared or shown later
export const save = async function(benchmark, { save: saveOpt }) {
  if (!saveOpt) {
    return
  }

  const dataDir = '/tmp/spyd'

  try {
    await add(dataDir, benchmark)
  } catch (error) {
    throw new Error(
      `Could not save benchmark to '${dataDir}':\n\n${error.stack}`,
    )
  }
}
