import { promisify } from 'util'

const pSetTimeout = promisify(setTimeout)

// The `duration` option is also used for timeout. This ensures:
//  - child processes do not run forever
//  - users set the correct `duration` depending on the task's duration
export const waitForTimeout = async function(duration) {
  // `setTimeout()` minimum is always 1ms
  const timeout = Math.max(duration / NANOSECS_TO_MICROSECS, 1)
  await pSetTimeout(timeout)

  throw new Error("Timeout: please increase the 'duration' option.")
}

const NANOSECS_TO_MICROSECS = 1e6
