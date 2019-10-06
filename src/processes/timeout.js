// The `duration` option is also used for timeout. This ensures:
//  - child processes do not run forever
//  - users set the correct `duration` depending on the task's duration
// The `debug` action does not use any timeout
export const getTimeout = function(duration) {
  if (duration === undefined) {
    return
  }

  return Math.max(duration / NANOSECS_TO_MILLISECS, 1)
}

export const getTimeoutError = function(duration) {
  const secs = Math.ceil(duration / NANOSECS_TO_SECS)
  return `timed out after ${secs} seconds. Please increase the 'duration' option.`
}

const NANOSECS_TO_MILLISECS = 1e6
const NANOSECS_TO_SECS = 1e9
