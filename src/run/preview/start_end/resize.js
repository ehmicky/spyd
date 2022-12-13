import process from 'node:process'

import { refreshPreview } from '../update/main.js'

// Refresh the preview when the terminal window is resized.
// We use SIGWINCH instead of `stream.on('resize')` because it does the same
// thing but without relying on specific streams.
// We purposely use `bind()` so that this function can be called several times
// concurrently.
export const startHandleResize = (previewState) => {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.handleResize = handleResize.bind(undefined, previewState)
  process.on('SIGWINCH', previewState.handleResize)
}

export const stopHandleResize = (previewState) => {
  process.off('SIGWINCH', previewState.handleResize)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete previewState.handleResize
}

const handleResize = (previewState) => {
  refreshPreview(previewState)
}
