// The `duration` option is also used for timeout. This ensures:
//  - child processes do not run forever
//  - the user sets a `duration` option higher than the task's duration
// The `debug` action does not use any timeout
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
