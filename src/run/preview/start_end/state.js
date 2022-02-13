import { START_DESCRIPTION } from '../description.js'
import { EMPTY_DURATION_LEFT } from '../update/completion.js'

// Retrieve initial `previewState`.
// This must be directly mutated because it is shared by reference by
// event-driven concurrent logic such as the stopping logic or the window
// resizing logic.
// When mutating it, it must always be in a consistent state at the end of a
// microtask since `updatePreview()` could be called by concurrent code.
// `index` and `total` are used as a 1-based counter in previews.
export const getPreviewState = function ({ reporters, titles }) {
  const quiet = !reporters.some(reporterHasPreview)
  return {
    quiet,
    titles,
    previewSamples: 0,
    durationLeft: EMPTY_DURATION_LEFT,
    percentage: 0,
    index: 0,
    combinationNameColor: '',
    description: START_DESCRIPTION,
    actions: [],
    scrollTop: 0,
    availableHeight: 0,
  }
}

// Add result-related properties to `previewState`
export const addResultPreviewState = function ({
  previewState,
  newResult: { combinations },
  result,
  sinceResult,
  noDimensions,
  config: { reporters },
}) {
  const reportersA = reporters.filter(reporterHasPreview)
  return {
    ...previewState,
    result,
    sinceResult,
    noDimensions,
    total: combinations.length,
    reporters: reportersA,
  }
}

// Each reporter can be set to use previews or not
//  - using `config.reporter.quiet`
//     - which defaults to `config.quiet`
//  - only if `output` is `stdout`
// The general preview features (including the progress bar) are only available
// if at least one reporter uses preview.
//  - This is kept as `previewState.quiet`
// Also, the programmatic reporter is never run during previews.
const reporterHasPreview = function ({ config: { quiet, output } }) {
  return !quiet && output === 'stdout'
}
