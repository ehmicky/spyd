import { normalizeMeasuredResult } from '../normalize/result.js'
import { updatePreviewReport } from '../preview/results.js'
import {
  startPreview,
  endPreview,
  printPreviewStarting,
} from '../preview/start_end.js'

import { createResult } from './create.js'
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

  const { result, previous } = await createResult(config)

  const { config: configA, previewState } = await startPreview(
    config,
    result,
    previous,
  )

  try {
    await updatePreviewReport(previewState)
    const resultA = await measureResult(result, configA, previewState)
    await endPreview(previewState, configA)
    return { result: resultA, previous }
  } catch (error) {
    await endPreview(previewState, configA, error)
    throw error
  }
}

const measureResult = async function (
  result,
  { cwd, precisionTarget },
  previewState,
) {
  const combinations = await measureCombinations(result.combinations, {
    precisionTarget,
    cwd,
    previewState,
    stage: 'main',
  })
  const resultA = { ...result, combinations }
  const resultB = normalizeMeasuredResult(resultA)
  return resultB
}
