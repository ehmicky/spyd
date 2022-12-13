// Estimate how many times to repeat the repeat loop.
//  - This is performed continuously based on the previous measures because fast
//    functions get optimized by runtimes after they are executed several times
//    in a row ("hot paths").
//  - When this happens, `repeat` needs to be computed again.
// The repeat loop is used to minimize the impact on the measures of both:
//  - `measureCost`
//  - high time `resolution`
// It repeats the task without the `measureCost` and performs an arithmetic mean
// We purposely avoid using the expected duration left so that increasing it
// does not change measures.
// When estimating `measureCost`, we should not use a repeat loop since
// `measureCost` only happens once per repeat loop.
// Iterating the `repeat` loop adds a small duration, due to the duration to
// increment the loop counter (e.g. 1 or 2 CPU cycles)
//  - We do not subtract that duration because it is variable, so would lower
//    the overall precision.
//  - Also measuring that duration is imperfect, which also lowers precision
//  - Moreover, estimating that duration takes duration and adds complexity
// Runners should minimize that loop counter duration. Using a simple "for" loop
// should be enough. Loop unrolling is an option but is tricky to get right and
// is probably not worth the effort:
//  - Functions with large loop unrolling might be deoptimized by compilers and
//    runtimes, or even hit memory limits. For example, in JavaScript, functions
//    with a few hundred statements are deoptimized. Also, `new Function()` body
//    has a max size.
//  - Parsing (as opposed to executing) the unrolled code should not be
//    measured. For example, in JavaScript, `new Function()` should be used,
//    not `eval()`.
// Calling each task also adds a small duration due to the duration it takes to
// create a new function stack:
//  - However, this duration is experienced by end users, so should be kept
//  - Inlining could be used to remove this, but it is hard to implement:
//     - The logic can be short-circuited if the task uses things like `return`
//     - The task might contain reference to outer scopes (with lexical
//       scoping), which would be broken by inlining
//  - Estimating that duration is hard since compilers/runtimes would typically
//    remove that function stack when trying to benchmark an empty task
// Not using loop unrolling nor subtracting `measureCost` nor the duration to
// iterate the `repeat` loop is better for precision, but worse for accuracy
// (this is tradeoff).
// Very fast functions might be optimized by compilers/runtimes:
//  - For example, simple tasks like `1 + 1` are often simply not executed
//  - Tricks like returning a value or assigning variables sometimes help
//    avoiding this
//  - The best way to benchmark those very fast functions is to increase their
//    complexity. Since the runner already runs those in a "for" loop, the only
//    thing that a task should do is increase the size of its inputs.
export const handleRepeat = ({
  repeat,
  sampleMedian,
  minLoopDuration,
  allSamples,
  calibrated,
}) => {
  if (minLoopDuration === 0) {
    return { newRepeat: 1, calibrated: true }
  }

  if (sampleMedian === 0) {
    return { newRepeat: repeat * FAST_MEDIAN_RATE, calibrated }
  }

  const newRepeatFloat = minLoopDuration / sampleMedian
  const newRepeat = Math.ceil(newRepeatFloat)

  if (calibrated) {
    return { newRepeat, calibrated }
  }

  const calibratedA = getCalibrated({
    repeat,
    newRepeat,
    newRepeatFloat,
    allSamples,
  })
  return { newRepeat, calibrated: calibratedA }
}

// `sampleMedian` can be 0 when the task is too close to `minLoopDuration`.
// In that case, we multiply the `repeat` with a fixed rate.
const FAST_MEDIAN_RATE = 10

// The number of `repeat` loops is estimated using the measures:
//  - Since those are based on the number of `repeat` loops themselves, there
//    is a feedback loop.
//  - This creates an initial calibration phase where `repeat` increases from
//    `1` to a stable number which does not vary much anymore.
// During calibration, `repeat` is not calibrated and measures can be greatly
// both inaccurate and imprecise.
//   - Therefore we remove the measures taken during calibration.
//   - We also do not report them, including in previews.
// Calibration happens only once, at the beginning:
//   - `calibrated` is initially `false`
//   - Once it becomes `true`, it never comes back to `false`
// We only reset cumulated stats.
//   - We do not reset stats which only use the last sample when those
//     cumulated stats are reset, such as `stats` and `repeat`.
// Calibrating will always remove the first sample (cold start):
//  - A downside is that this means cold starts will be included or not
//    depending on whether they are fast enough to use repeat loops.
//  - This can make it harder to compare some stats (especially `max`) between
//    combinations if some have repeat loops while others not.
//  - However, this problem is more general. Using repeat loops will always
//    change how the mean, min, max, stdev are computed since it uses an
//    arithmetic mean.
// The alternative solutions have bigger problems:
//  - Excluding all first samples, even without a repeat loop:
//     - This prevents running the combination only once, which is especially
//       problematic with `precision: 0`
//     - The first sample includes some useful stats since many functions are
//       only run once in real.
//     - This makes the first preview take longer to show up even if the
//       combination does not require any repeat loops.
//  - Excluding first samples except when there was not enough duration to
//    measure more:
//     - This rely on using a `duration` configuration property
//     - This creates a big difference of stats (especially mean and max)
//       depending on that duration
//     - This can lead to comparing combinations with and without the cold start
//       included in their stats
//  - Excluding first samples except when `precision: 0`
//     - Switching between `precision: 0` and others `precision` should show the
//       same results when lasting the same amount of time.
// Calibration is based on the difference between `repeat` and `newRepeat`.
const getCalibrated = ({ repeat, newRepeat, newRepeatFloat, allSamples }) =>
  !isColdStart(allSamples, newRepeatFloat) &&
  newRepeat / repeat <= MAX_REPEAT_DIFF

// The first sample (cold start) is usually much slower due to engine
// optimization and/or memoization. This can make hinder `repeat` calibration
// by indicating that the first sample needs no `repeat` loop (due to being
// much slower than it really is) while it actually does.
const isColdStart = (allSamples, newRepeatFloat) =>
  allSamples === 0 && newRepeatFloat > MIN_REPEAT_COLD_START

// When the first sample is that close to using the repeat loop, we continue
// calibrating.
// A higher number gives more false negatives, while a lower numbers gives more
// false positives.
const MIN_REPEAT_COLD_START = 1e-2

// To end calibration, `repeat` must vary once less than this percentage.
// It also ends when `repeat` is not increasing anymore.
// A higher number will include more uncalibrated measures, making the results
// more inaccurate and imprecise.
// A lower number will make calibration last longer, making combinations with
// low `duration` most likely to only use one sample.
const MAX_REPEAT_DIFF = 1.1
