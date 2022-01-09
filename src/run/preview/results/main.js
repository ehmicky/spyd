import { reportPreview } from '../../../report/main.js'
import { normalizeMeasuredResult } from '../../normalize.js'
import {
  setDescriptionIf,
  START_DESCRIPTION,
  MEASURE_DESCRIPTION,
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
export const updatePreviewStats = async function ({
  stats,
  previewState,
  durationState,
  sampleState,
  precisionTarget,
}) {
  if (shouldSkipPreview(previewState, stats)) {
    return
  }

  await updateResultStats({ previewState, stats })

  updateCombinationEnd({
    stats,
    previewState,
    durationState,
    sampleState,
    precisionTarget,
  })
  setDescriptionIf(previewState, MEASURE_DESCRIPTION, START_DESCRIPTION)

  await updatePreview(previewState)
}

const shouldSkipPreview = function ({ quiet }, { samples }) {
  return quiet || samples === 0
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
    combinationNameColor,
    reporters,
    titles,
    result,
    sinceResult,
    noDimensions,
  },
}) {
  const resultA = normalizeMeasuredResult(result)
  const preview = {
    durationLeft,
    percentage,
    index: index + 1,
    total,
    combinationNameColor,
  }
  const resultB = { ...resultA, preview }
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.report = await reportPreview({
    result: resultB,
    sinceResult,
    noDimensions,
    config: { reporters, titles },
  })
}
