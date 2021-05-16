import {
  normalizeMeasuredResult,
  normalizeReportedResult,
} from '../normalize/result.js'
import { initPreview } from '../preview/init.js'
import { updatePreviewReport } from '../preview/results.js'
import { startPreview, endPreview } from '../preview/start_end.js'

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
  const { initResult, newCombinations } = await createResult(config)
  const previewState = initPreview(initResult, newCombinations, config)
  await startPreview(previewState)

  try {
    await updatePreviewReport(previewState)
    const { rawResult, result } = await measureResult({
      initResult,
      newCombinations,
      config,
      previewState,
    })
    await endPreview(previewState)
    return { rawResult, result }
  } catch (error) {
    await endPreview(previewState, error)
    throw error
  }
}

const measureResult = async function ({
  initResult,
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
  const initResultA = addCombinations(initResult, newCombinationsA)
  const rawResult = normalizeMeasuredResult(initResultA)
  const result = normalizeReportedResult(rawResult)
  return { rawResult, result }
}
