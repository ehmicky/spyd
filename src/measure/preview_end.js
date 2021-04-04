import now from 'precise-now'

import { setBenchmarkEnd, setPercentage } from '../preview/set.js'

// Update the benchmark end in preview.
// When a combination ends, we do not include its remaining duration anymore.
// This allows `benchmarkEnd` to adjust progressively at the end of the
// benchmark as each combination ends.
// This also allows updating the progress bar duration to `0s` when the
// benchmark is stopped or errors.
export const updatePreviewEnd = function ({
  combination: { totalDuration, index },
  previewConfig: { quiet, combinations },
  previewState,
  duration,
}) {
  if (quiet) {
    return
  }

  const combinationsLeft = combinations.length - index

  if (duration === 1) {
    setPercentage(previewState, 1 - combinationsLeft / combinations.length)
    return
  }

  const timeLeft =
    Math.max(duration - totalDuration, 0) + (combinationsLeft - 1) * duration
  const benchmarkEnd = now() + timeLeft
  setBenchmarkEnd(previewState, benchmarkEnd)
}
