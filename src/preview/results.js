import {
  normalizeMeasuredResult,
  normalizeReportedResult,
} from '../normalize/result.js'
import { reportPreview } from '../report/main.js'

import { updateCompletion } from './completion.js'
import {
  setDescriptionIf,
  START_DESCRIPTION,
  MEASURE_DESCRIPTION,
} from './description.js'
import { updateCombinationEnd } from './duration.js'
import { refreshPreview } from './update.js'
import { wrapRows } from './wrap.js'

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
  previewState: { quiet, initResult, combinationIndex },
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  initResult.combinations[combinationIndex].stats = stats

  updateCombinationEnd({ stats, previewState, durationState, precisionTarget })
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
  },
}) {
  if (reporters.length === 0) {
    return
  }

  const result = normalizeMeasuredResult(initResult)
  const resultA = normalizeReportedResult(result)
  const report = await reportPreview(
    {
      ...resultA,
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
  const reportA = wrapRows(report)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = reportA
}
