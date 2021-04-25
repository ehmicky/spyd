import { updatePreview } from './update.js'

// Set the preview description
export const updateDescription = async function (previewState, description) {
  if (previewState.quiet) {
    return
  }

  setDescription(previewState, description)
  await updatePreview(previewState)
}

// Only remove a specific description.
// This prevents removing another description (e.g. stop description) by mistake
export const removeDescription = function (previewState, description) {
  if (previewState.description !== description) {
    return
  }

  setDescription(previewState, '')
}

const setDescription = function (previewState, description) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.description = description
}

export const START_DESCRIPTION = 'Starting'
export const END_DESCRIPTION = 'Ending'
export const STOP_DESCRIPTION = 'Stopping'
export const ABORT_DESCRIPTION = 'Stopping. Type CTRL-C to abort graceful exit.'
