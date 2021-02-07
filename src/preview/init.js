import { setDelayedDescription } from './set.js'
import { startPreview } from './start_end.js'

// Start preview
export const initPreview = async function ({ quiet }, previewState) {
  if (quiet) {
    return
  }

  await startPreview()

  setDelayedDescription(previewState, START_DESCRIPTION)
}

const START_DESCRIPTION = 'Starting...'
