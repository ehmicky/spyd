import { getFinalResult } from '../measure/init.js'
import { reportPreview } from '../report/main.js'

// Preview results progressively, as combinations are being measured
export const previewCombinations = async function ({
  combinations,
  newCombination,
  previewState,
  previewConfig,
}) {
  if (!hasNewStats(newCombination)) {
    return
  }

  await setPreviewReport({ combinations, previewState, previewConfig })
}

// Only create new preview when new stats are available.
const hasNewStats = function ({ bufferedMeasures, measures }) {
  return bufferedMeasures.length === 0 && measures.length !== 0
}

export const setPreviewReport = async function ({
  combinations,
  previewState,
  previewState: { initResult, results },
  previewConfig,
}) {
  const { result } = getFinalResult(combinations, initResult, results)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  previewState.report = await reportPreview(result, previewConfig)
}
