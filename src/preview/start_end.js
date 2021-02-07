import { addInitProps } from '../measure/props.js'

import { initPreview } from './init.js'
import { setPreviewReport } from './report.js'
import { setDelayedDescription } from './set.js'
import { firstPreview } from './update.js'

// Start preview
export const startPreview = async function ({
  combinations,
  duration,
  previewConfig,
  previewConfig: { quiet },
}) {
  const previewState = {}

  if (quiet) {
    return previewState
  }

  initPreview()

  const combinationsA = combinations.map(addInitProps)
  await setPreviewReport({
    combinations: combinationsA,
    previewState,
    previewConfig,
  })
  await firstPreview({ previewState, combinations: combinationsA, duration })

  setDelayedDescription(previewState, START_DESCRIPTION)
  return previewState
}

const START_DESCRIPTION = 'Starting...'
