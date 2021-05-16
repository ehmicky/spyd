import { getFinalResult } from '../normalize/init.js'
import { initPreview } from '../preview/init.js'
import { updatePreviewReport } from '../preview/results.js'
import { startPreview, endPreview } from '../preview/start_end.js'

import { measureCombinations } from './several.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performBenchmark = async function (
  config,
  combinations,
  initResult,
) {
  const combinationsA = await previewStartAndMeasure({
    combinations,
    config,
    initResult,
  })
  const { rawResult, result } = getFinalResult(initResult, combinationsA)
  return { rawResult, result }
}

const previewStartAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, precisionTarget },
  initResult,
}) {
  const previewState = initPreview(initResult, config, combinations)
  await startPreview(previewState)

  try {
    await updatePreviewReport(previewState)

    const combinationsA = await measureCombinations(combinations, {
      precisionTarget,
      cwd,
      previewState,
      stage: 'main',
    })
    await endPreview(previewState)
    return combinationsA
  } catch (error) {
    await endPreview(previewState, error)
    throw error
  }
}
