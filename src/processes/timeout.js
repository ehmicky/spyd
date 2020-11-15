// The `duration` option is also used for timeout. This ensures:
//  - child processes do not run forever
//  - the user set a `duration` option too low
// The `debug` action does not use any timeout
export const getTimeout = function (duration) {
  if (duration === undefined) {
    return
  }

  return Math.ceil(duration / NANOSECS_TO_MILLISECS)
}

export const getTimeoutError = function (duration) {
  const secs = Math.ceil(duration / NANOSECS_TO_SECS)
  return `timed out after ${secs} seconds. Please increase the 'duration' option.`
}

const NANOSECS_TO_MILLISECS = 1e6
const NANOSECS_TO_SECS = 1e9
