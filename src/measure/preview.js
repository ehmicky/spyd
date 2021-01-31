import { reportPreview } from '../report/main.js'

import { getFinalResult } from './init.js'

// Preview results progressively, as combinations are being measured
export const previewCombinations = async function ({
  combinations,
  newCombination,
  previewState,
  previewState: { initResult, results },
  previewConfig,
}) {
  if (!shouldPreview(newCombination)) {
    return
  }

  const { result } = getFinalResult(combinations, initResult, results)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  previewState.report = await reportPreview(result, previewConfig)
}

// Only create new preview when new stats are available.
const shouldPreview = function ({ bufferedMeasures, measures }) {
  return bufferedMeasures.length === 0 && measures.length !== 0
}
