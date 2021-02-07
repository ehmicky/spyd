// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are executed several times in
// a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
// The repeat loop is used to minimize the impact on the measures of both:
//  - `measureCost`
//  - low resolutions
// It repeats the task without the `measureCost` and perform an arithmetic mean.
// We purposely avoid using `duration` so that increasing it does not change
// measures.
// We use the `sampleMedian` instead of `stats.median`:
//  - So that `repeat` adjusts to slowdowns of the task (for example due to
//    competing processes).
//  - It makes the initial calibration phase shorter. This leads to more
//    stable `max` and `deviation` stats.
export const getRepeat = function ({
  repeat,
  sampleMedian,
  minLoopDuration,
  allSamples,
}) {
  // If the runner does not supports `repeat`, it is always set to `1`.
  // We should not use a repeat loop when estimating `measureCost` since
  // `measureCost` only happens once per repeat loop
  if (minLoopDuration === 0) {
    return { newRepeat: 1, coldStart: false }
  }

  const firstSample = allSamples === 1

  if (sampleMedian === 0) {
    return { newRepeat: repeat * FAST_MEDIAN_RATE, coldStart: firstSample }
  }

  const newRepeat = minLoopDuration / sampleMedian
  const coldStart = isColdStart(firstSample, newRepeat)
  const newRepeatA = Math.ceil(newRepeat)
  return { newRepeat: newRepeatA, coldStart }
}

// `sampleMedian` can be 0 when the task is too close to `minLoopDuration`.
// In that case, we multiply the `repeat` with a fixed rate.
const FAST_MEDIAN_RATE = 10

// The first sample (cold start) is usually much slower due to engine
// optimization and/or memoization. This can make hinder `repeat` calibration
// by indicating that the first sample needs no `repeat` loop (due to being
// much slower than it really is) while it actually does.
const isColdStart = function (firstSample, newRepeat) {
  return firstSample && newRepeat > MIN_COLD_START
}

// When the first sample is that close to using the repeat loop, we continue
// calibrating.
// A higher number gives more false negatives, while a lower numbers gives more
// false positives.
const MIN_COLD_START = 1e-2
