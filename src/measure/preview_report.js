import { EMPTY_DURATION_LEFT } from '../preview/completion.js'
import { setDescription, refreshPreviewReport } from '../preview/update.js'

import { getFinalResult } from './init.js'

// Retrieve initial `previewConfig`
// `index` and `total` are used as a 1-based counter in previews.
export const initPreview = function (
  initResult,
  { quiet, reporters, titles },
  combinations,
) {
  return {
    quiet,
    initResult,
    results: [],
    reporters,
    titles,
    combinations,
    previewSamples: 0,
    durationLeft: EMPTY_DURATION_LEFT,
    percentage: 0,
    index: 1,
    total: combinations.length,
  }
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
export const setFirstPreview = async function (previewConfig) {
  if (previewConfig.quiet) {
    return previewConfig
  }

  const previewConfigA = setDescription(previewConfig, START_DESCRIPTION)
  const previewConfigB = await setPreviewReport(previewConfigA)
  return previewConfigB
}

const START_DESCRIPTION = 'Starting'

export const updatePreviewReport = async function ({
  stats,
  stats: { samples },
  previewConfig,
  previewConfig: { quiet, combinations, measuredCombinations, index },
}) {
  if (quiet || samples === 0) {
    return
  }

  const combinationsA = [
    ...measuredCombinations,
    { ...combinations[index - 1], stats },
    ...combinations.slice(index).map(addEmptyStats),
  ]

  await setPreviewReport({ ...previewConfig, combinations: combinationsA })
}

const addEmptyStats = function (combination) {
  return { ...combination, stats: {} }
}

const setPreviewReport = async function (previewConfig) {
  const { initResult, results, reporters, combinations } = previewConfig
  const reportersA = reporters.filter(isNotQuiet)

  if (reportersA.length === 0) {
    return previewConfig
  }

  const { result } = getFinalResult(combinations, initResult, results)
  const previewConfigA = await refreshPreviewReport(previewConfig, result)
  return previewConfigA
}

// Reporters can opt-out of previews by defining `reporter.quiet: true`.
// This is a performance optimization for reporters which should not show
// results progressively.
const isNotQuiet = function ({ quiet = false }) {
  return !quiet
}
