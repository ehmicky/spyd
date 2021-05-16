import { EMPTY_DURATION_LEFT } from './completion.js'
import { START_DESCRIPTION } from './description.js'

// Retrieve initial `previewState`.
// This must be directly mutated because it is shared by reference by
// event-driven concurrent logic such as the stopping logic or the window
// resizing logic.
// When mutating it, it must always be in a consistent state at the end of a
// microtask since `updatePreview()` could be called by concurrent code.
// `index` and `total` are used as a 1-based counter in previews.
export const initPreview = function (
  result,
  newCombinations,
  { quiet, reporters, titles },
) {
  if (quiet) {
    return { quiet }
  }

  return {
    quiet,
    result,
    reporters: reporters.filter(isNotQuiet),
    titles,
    previewSamples: 0,
    durationLeft: EMPTY_DURATION_LEFT,
    percentage: 0,
    index: 0,
    total: newCombinations.length,
    combinationName: '',
    description: START_DESCRIPTION,
    actions: [],
    scrollTop: 0,
    availableHeight: 0,
  }
}

// Reporters can opt-out of previews by defining `reporter.quiet: true`.
// This is a performance optimization for reporters which should not show
// results progressively.
// This does not disable the progress bar preview though.
const isNotQuiet = function ({ quiet = false }) {
  return !quiet
}
