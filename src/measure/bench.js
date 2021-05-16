import { normalizeMeasuredResult } from '../normalize/result.js'
import { initPreview } from '../preview/init.js'
import { updatePreviewReport } from '../preview/results.js'
import {
  startPreview,
  endPreview,
  printPreviewStarting,
} from '../preview/start_end.js'

import { addCombinations, createResult } from './create.js'
import { measureCombinations } from './several.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performBenchmark = async function (config) {
  printPreviewStarting(config)

  const { result, newCombinations } = await createResult(config)

  const previewState = initPreview(result, newCombinations, config)
  const configA = await startPreview(previewState, config)

  try {
    await updatePreviewReport(previewState)
    const resultA = await measureResult({
      result,
      newCombinations,
      config: configA,
      previewState,
    })
    await endPreview(previewState, configA)
    return resultA
  } catch (error) {
    await endPreview(previewState, configA, error)
    throw error
  }
}

const measureResult = async function ({
  result,
  newCombinations,
  config: { cwd, precisionTarget },
  previewState,
}) {
  const newCombinationsA = await measureCombinations(newCombinations, {
    precisionTarget,
    cwd,
    previewState,
    stage: 'main',
  })
  const resultA = addCombinations(result, newCombinationsA)
  const resultB = normalizeMeasuredResult(resultA)
  return resultB
}
