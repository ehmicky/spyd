import { compressResult } from '../normalize/compress.js'

import { addResult } from './store.js'

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
export const addToStore = async function (result, { save, cwd }, stopped) {
  if (!save || stopped) {
    return
  }

  const resultA = compressResult(result)
  await addResult(resultA, cwd)
}
