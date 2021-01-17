import { UserError } from '../error/main.js'
import { compressResult } from '../normalize/compress.js'
import { mergeResults } from '../normalize/merge.js'

import { listStore } from './list.js'

// Add a new result
export const addToStore = async function ({ result, config, stopped }) {
  const results = await listStore(config)

  await saveResult({ result, config, stopped })

  const resultsA = [...results, result]
  const resultA = mergeResults(resultsA)
  return resultA
}

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
const saveResult = async function ({
  result,
  config: { save, store },
  stopped,
}) {
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
