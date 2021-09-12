import now from 'precise-now'

import { getCombinationNameColor } from '../../combination/name.js'

import { START_DESCRIPTION } from './description.js'
import { updatePreview } from './update/main.js'

// Done when combination starts
export const startCombinationPreview = async function (
  previewState,
  combination,
  index,
) {
  if (previewState.quiet) {
    return
  }

  const combinationName = getCombinationNameColor(combination)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, {
    combinationStart: now(),
    combinationEnd: undefined,
    previewSamples: 0,
    index,
    combinationName,
    description: START_DESCRIPTION,
  })
  await updatePreview(previewState)
}

// Done when combination ends
export const endCombinationPreview = async function (previewState) {
  if (previewState.quiet) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.combinationEnd = now()
  await updatePreview(previewState)
}
