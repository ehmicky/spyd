import { UserError } from '../error/main.js'
import { compressResult } from '../normalize/compress.js'
import { mergeResults } from '../normalize/merge.js'

// Add a new result
export const addToStore = async function ({
  results,
  result,
  config: { save, store, since },
  stopped,
}) {
  await saveResult({ result, save, store, stopped })

  const resultsA = [result, ...results]
  const resultA = mergeResults(resultsA, since)
  return resultA
}

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
const saveResult = async function ({ result, save, store, stopped }) {
  if (!save || stopped) {
    return
  }

  const resultA = compressResult(result)

  try {
    await store.add(resultA)
  } catch (error) {
    throw new UserError(`Could not save result: ${error.message}`)
  }
}
