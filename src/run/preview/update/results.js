import { reportPreview } from '../../../report/main.js'
import { normalizeMeasuredResult } from '../../normalize.js'
import {
  setDescriptionIf,
  START_DESCRIPTION,
  MEASURE_DESCRIPTION,
} from '../description.js'

import { updateCombinationEnd } from './duration.js'
import { updatePreview } from './refresh.js'

// Preview results progressively, as combinations are being measured.
// Reporters should:
//  - Handle combinations not measured yet, i.e. with `undefined` `stats`.
//     - Their titles should be reported so that users know which combinations
//       are left
//  - Try to limit the amount of flicker between previews
//     - For example, all combinations should be shown even if not measured yet.
//     - And the size of table should not change between previews.
// When uncalibrated, we skip it since no stats would be reported anyway.
//  - We wait until calibration before removing the start description.
//  - We also never report nor stop measuring when `median` is `0`
export const updatePreviewStats = async function ({
  stats,
  previewState,
  durationState,
  precisionTarget,
}) {
  if (shouldSkipPreview(previewState, stats)) {
    return
  }

  await updateResultStats({ previewState, stats })

  updateCombinationEnd({ stats, previewState, durationState, precisionTarget })
  setDescriptionIf(previewState, MEASURE_DESCRIPTION, START_DESCRIPTION)

  await updatePreview(previewState)
}

const shouldSkipPreview = function ({ quiet }, { samples, median }) {
  return quiet || samples === 0 || median === 0
}

const updateResultStats = async function ({
  previewState,
  previewState: { result, index },
  stats,
}) {
  const combinations = [
    ...result.combinations.slice(0, index),
    { ...result.combinations[index], stats },
    ...result.combinations.slice(index + 1),
  ]
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.result = { ...result, combinations }
  await updateReport({ previewState })
}

// Update `previewState.report`, i.e. serialized report for previews
export const updateReport = async function ({
  previewState,
  previewState: {
    durationLeft,
    percentage,
    index,
    total,
    combinationName,
    reporters,
    titles,
    result,
    historyInfo,
  },
}) {
  const resultA = normalizeMeasuredResult(result)
  const preview = {
    durationLeft,
    percentage,
    index: index + 1,
    total,
    combinationName,
  }
  const resultB = { ...resultA, preview }
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = await reportPreview(resultB, historyInfo, {
    reporters,
    titles,
  })
}
