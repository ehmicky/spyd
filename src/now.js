// Abstraction layer to retrieve timestamps for diff/comparison purpose
// (operators: - < <= > >=).
// The timestamp itself should only be used for those purposes since it can mean
// several things depending on the platform.
// Designed to run very fast.
// Comparison between methods:
//   - `Date()`:
//      - works in all environments
//      - duration since Epoch
//      - integers (milliseconds)
//      - slowest. But faster than `new Date().getTime()` and
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
const getExports = function() {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  if (process !== undefined) {
    return { name: 'hrtime', now: hrtime }
  }

  // eslint-disable-next-line no-undef
  if (performance !== undefined) {
    return { name: 'performance.now', now: performanceNow }
  }

  return { name: 'date.now', now: dateNow }
}

const hrtime = function() {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  const [secs, nanosecs] = process.hrtime()
  return secs * SECS_TO_NANOSECS + nanosecs
}

const performanceNow = function() {
  // eslint-disable-next-line no-undef
  return Math.round(performance.now() * MILLISECONDS_TO_NANOSECS)
}

const dateNow = function() {
  return Date.now() * MILLISECONDS_TO_NANOSECS
}

const SECS_TO_NANOSECS = 1e9
const MILLISECONDS_TO_NANOSECS = 1e6

const { name, now } = getExports()
export { name, now }
