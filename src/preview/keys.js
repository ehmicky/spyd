import process from 'process'

import { refreshPreview } from './update.js'

// Handle user actions through key events.
// We purposely use `bind()` so that this function can be called several times
// concurrently.
export const startHandleKeys = function (previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.handleKeyEvent = handleKeyEvent.bind(undefined, previewState)
  process.on('SIGYO', previewState.handleKeyEvent)
}

export const stopHandleKeys = function (previewState) {
  process.off('SIGYO', previewState.handleKeyEvent)
}

const handleKeyEvent = function (previewState) {
  refreshPreview(previewState)
}
