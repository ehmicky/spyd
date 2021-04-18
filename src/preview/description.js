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
