import { EMPTY_DURATION_LEFT } from '../preview/completion.js'
import { refreshPreviewReport } from '../preview/update.js'

import { getFinalResult } from './init.js'
import { updateCombinationPreview } from './preview_duration.js'

// Retrieve initial `previewConfig`
// `index` and `total` are used as a 1-based counter in previews.
export const initPreview = function (
  initResult,
  { quiet, reporters, titles },
  combinations,
) {
  const reportersA = reporters.filter(isNotQuiet)

  if (quiet || reportersA.length === 0) {
    return { quiet: true }
  }

  const combinationsA = combinations.map(addEmptyStats)
  return {
    quiet,
    initResult,
    results: [],
    reporters: reportersA,
    titles,
    combinations: combinationsA,
    previewSamples: 0,
    durationLeft: EMPTY_DURATION_LEFT,
    percentage: 0,
    index: 0,
    total: combinationsA.length,
    description: START_DESCRIPTION,
  }
}

const START_DESCRIPTION = 'Starting'

// Reporters can opt-out of previews by defining `reporter.quiet: true`.
// This is a performance optimization for reporters which should not show
// results progressively.
const isNotQuiet = function ({ quiet = false }) {
  return !quiet
}

const addEmptyStats = function (combination) {
  return { ...combination, stats: {} }
}

// Preview results progressively, as combinations are being measured.
// Reporters should:
//  - Handle combinations not measured yet, i.e. with `undefined` `stats`.
//     - Their titles should be reported so that users know which combinations
//       are left
//  - Try to limit the amount of flicker between previews
//     - For example, all combinations should be shown even if not measured yet.
//     - And the size of table should not change between previews.
// When uncalibrated, we skip it since no stats would be reported anyway.
export const updatePreviewReport = async function ({
  stats,
  stats: { samples },
  previewConfig,
  previewConfig: { quiet, combinations, index },
  durationState,
  precisionTarget,
}) {
  if (quiet || samples === 0) {
    return previewConfig
  }

  const previewConfigA = updateCombinationPreview({
    stats,
    previewConfig,
    durationState,
    precisionTarget,
  })
  const combinationsA = [
    ...combinations.slice(0, index),
    { ...combinations[index], stats },
    ...combinations.slice(index + 1),
  ]
  const previewConfigB = { ...previewConfigA, combinations: combinationsA }

  const previewConfigC = await setPreviewReport({
    previewConfig: previewConfigB,
  })
  return previewConfigC
}

export const setPreviewReport = async function ({
  previewConfig,
  previewConfig: { quiet, initResult, results, combinations },
}) {
  if (quiet) {
    return previewConfig
  }

  const { result } = getFinalResult(combinations, initResult, results)
  const previewConfigA = await refreshPreviewReport(previewConfig, result)
  return previewConfigA
}
