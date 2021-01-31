import { UserError } from '../error/main.js'
import { compressResult } from '../normalize/compress.js'

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
export const addToStore = async function (result, { save, store }, stopped) {
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
