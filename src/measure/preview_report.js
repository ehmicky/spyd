import { EMPTY_DURATION_LEFT } from '../preview/completion.js'
import { setDelayedDescription } from '../preview/description.js'
import { updatePreview } from '../preview/update.js'
import { reportPreview } from '../report/main.js'

import { getFinalResult } from './init.js'

// Retrieve initial `previewConfig` (stateless) and `previewState` (stateful).
// `index` and `total` are used as a 1-based counter in previews.
export const initPreview = function (
  initResult,
  { quiet, reporters, titles },
  combinations,
) {
  const previewConfig = {
    quiet,
    initResult,
    results: [],
    reporters,
    titles,
    combinations,
    previewSamples: 0,
    index: 1,
    total: combinations.length,
  }
  const previewState = { durationLeft: EMPTY_DURATION_LEFT, percentage: 0 }
  return { previewConfig, previewState }
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
export const setFirstPreview = async function ({
  previewConfig,
  previewConfig: { quiet },
  previewState,
}) {
  if (quiet) {
    return
  }

  await setPreviewReport({ previewConfig, previewState })
  setDelayedDescription(previewState, START_DESCRIPTION)
}

const START_DESCRIPTION = 'Starting...'

export const updatePreviewReport = async function ({
  stats,
  stats: { samples },
  previewConfig,
  previewConfig: { quiet, combinations, measuredCombinations, index },
  previewState,
}) {
  if (quiet || samples === 0) {
    return
  }

  const combinationsA = [
    ...measuredCombinations,
    { ...combinations[index - 1], stats },
    ...combinations.slice(index).map(addEmptyStats),
  ]

  await setPreviewReport({
    previewConfig: { ...previewConfig, combinations: combinationsA },
    previewState,
  })
}

const addEmptyStats = function (combination) {
  return { ...combination, stats: {} }
}

const setPreviewReport = async function ({
  previewConfig,
  previewConfig: {
    initResult,
    results,
    reporters,
    titles,
    combinations,
    index,
    total,
  },
  previewState,
  previewState: { durationLeft, percentage },
}) {
  const reportersA = reporters.filter(isNotQuiet)

  if (reportersA.length === 0) {
    return
  }

  const { result } = getFinalResult(combinations, initResult, results)
  const resultA = {
    ...result,
    preview: { durationLeft, index, total, percentage },
  }
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  previewState.report = await reportPreview(resultA, {
    reporters: reportersA,
    titles,
  })
  await updatePreview(previewState, previewConfig)
}

// Reporters can opt-out of previews by defining `reporter.quiet: true`.
// This is a performance optimization for reporters which should not show
// results progressively.
const isNotQuiet = function ({ quiet = false }) {
  return !quiet
}
