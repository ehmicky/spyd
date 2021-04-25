import { getFinalResult } from '../normalize/init.js'
import { reportPreview } from '../report/main.js'

import { updateCompletion } from './completion.js'
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

  const combinationEndProps = updateCombinationEnd({
    stats,
    previewState,
    durationState,
    precisionTarget,
  })
  const combinationsA = [
    ...combinations.slice(0, index),
    { ...combinations[index], stats },
    ...combinations.slice(index + 1),
  ]
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, {
    ...combinationEndProps,
    combinations: combinationsA,
  })

  await updatePreviewResults(previewState)
}

export const updatePreviewResults = async function (previewState) {
  if (previewState.quiet) {
    return
  }

  updateCompletion(previewState)
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
    reporters,
    titles,
    initResult,
    results,
    combinations,
  },
}) {
  const { result } = getFinalResult(combinations, initResult, results)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = await reportPreview(
    {
      ...result,
      preview: { durationLeft, percentage, index: index + 1, total },
    },
    { reporters, titles },
  )
}
