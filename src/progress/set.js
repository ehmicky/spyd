// Like `setDescription()` but wait for a specific `delay` first to avoid
// flickering.
export const setDelayedDescription = function (progressState, description) {
  const descriptionTimeout = setTimeout(
    () => setDescription(progressState, description),
    DESCRIPTION_DELAY,
  )
  descriptionTimeout.unref()
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  progressState.descriptionTimeout = descriptionTimeout
}

const DESCRIPTION_DELAY = 1e3

// Set the progress reporting description
export const setDescription = function (progressState, description) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  progressState.description = description
  unsetDescriptionTimeout(progressState)
}

const unsetDescriptionTimeout = function (progressState) {
  if (progressState.descriptionTimeout === undefined) {
    return
  }

  clearTimeout(progressState.descriptionTimeout)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete progressState.descriptionTimeout
}

// Set the progress reporting duration and percentage by setting the expected
// end of the benchmark
export const setBenchmarkEnd = function (progressState, benchmarkEnd) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  progressState.benchmarkEnd =
    progressState.benchmarkEnd === undefined
      ? benchmarkEnd
      : Math.min(progressState.benchmarkEnd, benchmarkEnd)
}
