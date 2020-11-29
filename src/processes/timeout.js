// The `duration` option is also used for timeout. This ensures:
//  - child processes do not execute forever
//  - the user sets a `duration` option higher than the task's duration
// The `debug` action does not use any timeout
// Timeouts are only meant to stop tasks that are longer than the
// `processGroupDuration`. In that case, measuring is just impossible.
// Failing the run is disruptive and should only be done when there is no
// possible fallback. For example, if a task was executed several times but
// becomes much slower in the middle of the combination (while still being
// slower than the `duration` option), we should not fail. Instead, the task
// will just take a little longer. We must just make a best effort to minimize
// the likelihood of this to happen.
export const getTimeout = function (timeoutNs) {
  if (timeoutNs === undefined) {
    return
  }

  return Math.ceil(timeoutNs / NANOSECS_TO_MILLISECS)
}

export const getTimeoutError = function (timeoutNs) {
  const secs = Math.ceil(timeoutNs / NANOSECS_TO_SECS)
  return `timed out after ${secs} seconds. Please increase the 'duration' option.`
}

const NANOSECS_TO_MILLISECS = 1e6
const NANOSECS_TO_SECS = 1e9
