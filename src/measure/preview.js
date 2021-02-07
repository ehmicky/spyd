import { reportPreview } from '../report/main.js'

import { getFinalResult } from './init.js'
import { addInitProps } from './props.js'
import { updateCombinations } from './update.js'

// Retrieve state and configuration for previews
export const getPreviewConfig = function ({
  config: { quiet, reporters, titles },
  initResult,
}) {
  const previewState = {}
  const previewConfig = { quiet, initResult, results: [], reporters, titles }
  return { previewState, previewConfig }
}

// Preview results progressively, as combinations are being measured.
// Reporters should:
//  - Handle combinations not measured yet, i.e. with `undefined` `stats`
//  - Try to limit the amount of flicker between previews
//     - For example, all combinations should be shown even if not measured yet.
//     - And the size of table should not change between previews.
// When uncalibrated, we skip it since no stats would be reported anyway.
export const setFirstPreview = async function ({
  combinations,
  previewState,
  previewConfig,
}) {
  const combinationsA = combinations.map(addInitProps)
  await setPreviewReport({
    combinations: combinationsA,
    previewState,
    previewConfig,
  })
}

export const previewCombinations = async function ({
  combinations,
  newCombination,
  newCombination: { calibrated },
  previewConfig,
  previewState,
}) {
  if (!calibrated) {
    return
  }

  const combinationsA = updateCombinations(combinations, newCombination)
  await setPreviewReport({
    combinations: combinationsA,
    previewConfig,
    previewState,
  })
}

const setPreviewReport = async function ({
  combinations,
  previewConfig: { initResult, results, quiet, reporters, titles },
  previewState,
  previewState: { time, percentage },
}) {
  if (quiet) {
    return
  }

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
