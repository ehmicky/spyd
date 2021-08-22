import { normalizeMeasuredResult } from '../../normalize/result.js'
import { reportPreview } from '../../report/main.js'

import { updateCompletion } from './completion.js'
import {
  setDescriptionIf,
  START_DESCRIPTION,
  MEASURE_DESCRIPTION,
} from './description.js'
import { updateCombinationEnd } from './duration.js'
import { refreshPreview } from './update.js'

// Preview results progressively, as combinations are being measured.
// Reporters should:
//  - Handle combinations not measured yet, i.e. with `undefined` `stats`.
//     - Their titles should be reported so that users know which combinations
//       are left
//  - Try to limit the amount of flicker between previews
//     - For example, all combinations should be shown even if not measured yet.
//     - And the size of table should not change between previews.
// When uncalibrated, we skip it since no stats would be reported anyway.
// We wait until calibration before removing the start description.
export const updatePreviewStats = async function ({
  stats,
  stats: { samples },
  previewState,
  previewState: { quiet },
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0) {
    return
  }

  await updateResultStats({ previewState, stats })

  updateCombinationEnd({ stats, previewState, durationState, precisionTarget })
  setDescriptionIf(previewState, MEASURE_DESCRIPTION, START_DESCRIPTION)
  updateCompletion(previewState)

  await refreshPreview(previewState)
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
    historyResult,
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
  previewState.report = await reportPreview(resultB, historyResult, {
    reporters,
    titles,
  })
}
