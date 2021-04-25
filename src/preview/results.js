import { getFinalResult } from '../normalize/init.js'
import { reportPreview } from '../report/main.js'

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
  previewState: { quiet, combinations, index },
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0) {
    return
  }

  updateCombinationEnd({ stats, previewState, durationState, precisionTarget })
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  combinations[index].stats = stats
  setDescriptionIf(previewState, MEASURE_DESCRIPTION, START_DESCRIPTION)

  updateCompletion(previewState)
  await updatePreviewReport(previewState)
}

export const updatePreviewReport = async function (previewState) {
  if (previewState.quiet) {
    return
  }

  await updateReport({ previewState })
  await refreshPreview(previewState)
}

const updateReport = async function ({
  previewState,
  previewState: {
    durationLeft,
    percentage,
    index,
    total,
    combinationName,
    reporters,
    titles,
    initResult,
    results,
    combinations,
  },
}) {
  if (reporters.length === 0) {
    return
  }

  const { result } = getFinalResult(combinations, initResult, results)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = await reportPreview(
    {
      ...result,
      preview: {
        durationLeft,
        percentage,
        index: index + 1,
        total,
        combinationName,
      },
    },
    { reporters, titles },
  )
}
