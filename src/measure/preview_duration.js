import now from 'precise-now'

// Update the combination start and expected end.
// This is combined with the current timestamp to compute the expected duration
// left and percentage in previews.
// Done when combination starts
export const startCombinationPreview = function (
  previewState,
  duration,
  index,
) {
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { combinationStart: now(), index })
  updateCombinationEnd(previewState, duration)
}

// Done when combination's sample starts
export const updateCombinationPreview = function ({
  previewConfig: { quiet },
  previewState,
  durationState: { totalDuration },
  duration,
}) {
  if (quiet) {
    return
  }

  const durationLeft = Math.max(duration - totalDuration, 0)
  updateCombinationEnd(previewState, durationLeft)
}

// Done when combination ends
export const endCombinationPreview = function (previewState) {
  updateCombinationEnd(previewState, 0)
}

const updateCombinationEnd = function (previewState, durationLeft) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.combinationEnd = now() + durationLeft
}
