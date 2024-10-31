import { reportPreview } from '../../../report/main.js'
import { updateCombinationStats } from '../../normalize.js'
import {
  MEASURE_DESCRIPTION,
  setDescriptionIf,
  START_DESCRIPTION,
} from '../description.js'
import { updatePreview } from '../update/main.js'

import { updateCombinationEnd } from './duration.js'

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
export const updatePreviewStats = async ({
  stats,
  previewState,
  durationState,
  sampleState,
  precision,
}) => {
  if (shouldSkipPreview(previewState, stats)) {
    return
  }

  await updateResultStats(previewState, stats)

  updateCombinationEnd({
    stats,
    previewState,
    durationState,
    sampleState,
    precision,
  })
  setDescriptionIf(previewState, MEASURE_DESCRIPTION, START_DESCRIPTION)

  await updatePreview(previewState)
}

const shouldSkipPreview = ({ quiet }, { samples }) => quiet || samples === 0

const updateResultStats = async (previewState, stats) => {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.result = updateCombinationStats(
    previewState.result,
    stats,
    previewState.index,
  )
  await updateReport({ previewState })
}

// Update `previewState.report`, i.e. serialized report for previews
export const updateReport = async ({
  previewState,
  previewState: {
    durationLeft,
    percentage,
    index,
    total,
    combinationNameColor,
    reporters,
    titles,
    result,
    sinceResult,
    noDimensions,
  },
}) => {
  const preview = {
    durationLeft,
    percentage,
    index: index + 1,
    total,
    combinationNameColor,
  }
  const resultA = { ...result, preview }
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = await reportPreview({
    result: resultA,
    sinceResult,
    noDimensions,
    config: { reporters, titles },
  })
}
