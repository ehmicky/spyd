import now from 'precise-now'

// Like `setDescription()` but wait for a specific `delay` first to avoid
// flickering.
export const setDelayedDescription = function (previewState, description) {
  const descriptionTimeout = setTimeout(
    () => setDescription(previewState, description),
    DESCRIPTION_DELAY,
  )
  descriptionTimeout.unref()
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.descriptionTimeout = descriptionTimeout
}

const DESCRIPTION_DELAY = 1e3

// Set the preview description
export const setDescription = function (previewState, description) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.description = description
  unsetDescriptionTimeout(previewState)
}

const unsetDescriptionTimeout = function (previewState) {
  if (previewState.descriptionTimeout === undefined) {
    return
  }

  clearTimeout(previewState.descriptionTimeout)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete previewState.descriptionTimeout
}

// Set the preview description, but with higher priority.
export const setPriorityDescription = function (
  previewState,
  priorityDescription,
) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.priorityDescription = priorityDescription
}

export const getDescription = function ({
  description,
  priorityDescription,
  benchmarkDuration,
}) {
  if (priorityDescription !== undefined) {
    return priorityDescription
  }

  if (description !== undefined) {
    return description
  }

  if (benchmarkDuration === 0) {
    return NO_DURATION_DESCRIPTION
  }
}

// Clear instruction when `duration` is 0
const NO_DURATION_DESCRIPTION = 'Type CTRL-C to stop.'

// Set the preview duration and percentage by setting the expected end of the
// benchmark
export const setBenchmarkEnd = function (previewState, benchmarkEnd) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.benchmarkEnd =
    previewState.benchmarkEnd === undefined
      ? benchmarkEnd
      : Math.min(previewState.benchmarkEnd, benchmarkEnd)
}

// When duration is 0 or 1, we count up, not down
export const setBenchmarkStart = function (previewState, duration) {
  if (duration !== 0 && duration !== 1) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.benchmarkStart = now()
}
