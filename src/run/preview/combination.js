import now from 'precise-now'

import { getCombinationNameColor } from '../../combination/ids/name.js'

import { START_DESCRIPTION } from './description.js'
import { updatePreview } from './update/main.js'

// Done when combination starts
export const startCombinationPreview = async ({
  previewState,
  combination,
  index,
  noDimensions,
}) => {
  if (previewState.quiet) {
    return
  }

  const combinationNameColor = getCombinationNameColor(
    combination,
    noDimensions,
  )
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, {
    combinationStart: now(),
    combinationEnd: undefined,
    previewSamples: 0,
    index,
    combinationNameColor,
    description: START_DESCRIPTION,
  })
  await updatePreview(previewState)
}

// Done when combination ends
export const endCombinationPreview = async (previewState) => {
  if (previewState.quiet) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.combinationEnd = now()
  await updatePreview(previewState)
}
