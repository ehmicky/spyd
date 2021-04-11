import { setDelayedDescription } from '../preview/set.js'
import { reportPreview } from '../report/main.js'

import { getFinalResult } from './init.js'

// Retrieve state and configuration for previews
export const getPreviewConfig = function (
  initResult,
  { quiet, reporters, titles },
  combinations,
) {
  return { quiet, initResult, results: [], reporters, titles, combinations }
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
  sampleState: { calibrated, stats },
  previewConfig,
  previewConfig: { quiet, combinations, index },
  previewState,
}) {
  if (quiet || !calibrated) {
    return
  }

  const combinationsA = [...combinations]
  // eslint-disable-next-line fp/no-mutation
  combinationsA[index] = { ...combinationsA[index], stats }

  await setPreviewReport({
    previewConfig: { ...previewConfig, combinations: combinationsA },
    previewState,
  })
}

const setPreviewReport = async function ({
  previewConfig: { initResult, results, reporters, titles, combinations },
  previewState,
  previewState: { time, percentage },
}) {
  const reportersA = reporters.filter(isNotQuiet)

  if (reportersA.length === 0) {
    return
  }

  const { result } = getFinalResult(combinations, initResult, results)
  const resultA = { ...result, time, percentage }
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  previewState.report = await reportPreview(resultA, {
    reporters: reportersA,
    titles,
  })
}

// Reporters can opt-out of previews by defining `reporter.quiet: true`.
// This is a performance optimization for reporters which should not show
// results progressively.
const isNotQuiet = function ({ quiet = false }) {
  return !quiet
}
