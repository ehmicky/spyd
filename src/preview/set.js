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

export const getDescription = function (
  description,
  priorityDescription = description,
) {
  return priorityDescription
}

// Set the preview duration and percentage by setting the expected end.
// set the expected end instead of the expected time left so that the preview
// refresh logic can progressively decrease as time passes, even if
// `setBenchmarkEnd()` is not called again.
export const setBenchmarkEnd = function (previewState, benchmarkEnd) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.benchmarkEnd = benchmarkEnd
}

// When duration is 1, we count up, not down
export const setBenchmarkStart = function (previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.benchmarkStart = now()
}

// When duration is 1, we increase the progress bar each time a combination ends
export const setPercentage = function (previewState, percentage) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.percentage = percentage
}

// When benchmark ends, make sure progress shows as complete
export const setFinalPreview = function (previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.benchmarkEnd = now()
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.percentage = 1
}
