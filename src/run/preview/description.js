import { updatePreview } from './update/main.js'

// Set the preview description
export const updateDescription = async (previewState, description) => {
  if (previewState.quiet) {
    return
  }

  setDescription(previewState, description)
  await updatePreview(previewState)
}

// Only set a specific description if the current matches a specific one.
// Meant to prevent unsetting an abnormal description like "Stopping"
export const setDescriptionIf = (
  previewState,
  newDescription,
  currentDescription,
) => {
  if (previewState.description !== currentDescription) {
    return
  }

  setDescription(previewState, newDescription)
}

const setDescription = (previewState, description) => {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.description = description
}

export const START_DESCRIPTION = 'Starting'
export const MEASURE_DESCRIPTION = 'Measuring'
export const END_DESCRIPTION = 'Ending'
export const STOP_DESCRIPTION = 'Stopping'
