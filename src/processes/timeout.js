import pTimeout from 'p-timeout'

// The `duration` option is also used for timeout. This ensures:
//  - child processes do not run forever
//  - users set the correct `duration` depending on the task's duration
export const childTimeout = function(promise, duration) {
  // `setTimeout()` minimum is always 1ms
  const timeout = Math.max(duration / NANOSECS_TO_MICROSECS, 1)
  const secs = Math.ceil(duration / NANOSECS_TO_SECS)
  return pTimeout(
    promise,
    timeout,
    `Timed out after ${secs} seconds: please increase the 'duration' option`,
  )
}

const NANOSECS_TO_MICROSECS = 1e6
const NANOSECS_TO_SECS = 1e9
