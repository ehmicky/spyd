import { DEFAULT_ACTIONS } from './action.js'
import { EMPTY_DURATION_LEFT } from './completion.js'

// Retrieve initial `previewState`.
// This must be directly mutated because it is shared by reference by
// event-driven concurrent logic such as the stopping logic or the window
// resizing logic.
// When mutating it, it must always be in a consistent state at the end of a
// microtask since `updatePreview()` could be called by concurrent code.
// `index` and `total` are used as a 1-based counter in previews.
export const initPreview = function (
  initResult,
  { quiet, reporters, titles },
  combinations,
) {
  if (quiet) {
    return { quiet }
  }

  const reportersA = reporters.filter(isNotQuiet)
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
    combinationName: '',
    description: START_DESCRIPTION,
    actions: DEFAULT_ACTIONS,
  }
}

const START_DESCRIPTION = 'Starting'

// Reporters can opt-out of previews by defining `reporter.quiet: true`.
// This is a performance optimization for reporters which should not show
// results progressively.
// This does not disable the progress bar preview though.
const isNotQuiet = function ({ quiet = false }) {
  return !quiet
}

const addEmptyStats = function (combination) {
  return { ...combination, stats: {} }
}
