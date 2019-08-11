// Abstraction layer to retrieve timestamps for diff/comparison purpose
// (operators: - < <= > >=).
// The timestamp itself should only be used for those purposes since it can mean
// several things depending on the platform.
// Designed to run very fast.
// Comparison between methods:
//   - `Date.now()`:
//      - works in all environments
//      - duration since Epoch
//      - integers (milliseconds)
//      - fastest. Also faster than `new Date().getTime()` and
//        `Number(new Date())`
//      - less accurate. Can be skewed by OS clock.
//      - less precise: only milliseconds precise. The other methods are as
//        precise as the system time resolution.
//   - `performance.now()`:
//      - works in all environments.
//      - duration since process was started
//      - float (milliseconds)
//      - in Node, it is built on top of `hrtime()`, i.e. slower
//   - `hrtime()`:
//      - Node only
//      - duration since machine was started
//      - array of two integers (seconds and nanoseconds)
//   - `hrtime.bigint()`:
//      - Node only
//      - duration since machine was started
//      - bigint (nanoseconds)
//      - slightly slower than `hrtime()`
const getExport = function() {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  if (process !== undefined) {
    return hrtime
  }

  // eslint-disable-next-line no-undef
  if (performance !== undefined) {
    return performanceNow
  }

  return dateNow
}

const hrtime = function() {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  const [secs, nanosecs] = process.hrtime()
  return secs * NANOSECS_TO_SECS + nanosecs
}

const performanceNow = function() {
  // eslint-disable-next-line no-undef
  return Math.round(performance.now() * NANOSECS_TO_MILLISECS)
}

const dateNow = function() {
  return Date.now() * NANOSECS_TO_MILLISECS
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MILLISECS = 1e6

export const now = getExport()
