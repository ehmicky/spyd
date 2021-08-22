import process from 'process'

import { refreshPreview } from './update.js'

// Refresh the preview when the terminal window is resized.
// We use SIGWINCH instead of `stream.on('resize')` because it does the same
// thing but without relying on specific streams.
// We purposely use `bind()` so that this function can be called several times
// concurrently.
export const startHandleResize = function (previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.handleResize = handleResize.bind(undefined, previewState)
  process.on('SIGWINCH', previewState.handleResize)
}

export const stopHandleResize = function (previewState) {
  process.off('SIGWINCH', previewState.handleResize)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete previewState.handleResize
}

const handleResize = function (previewState) {
  refreshPreview(previewState)
}
