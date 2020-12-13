export const getTimeout = function (timeoutNs) {
  if (timeoutNs === undefined) {
    return
  }

  return Math.ceil(timeoutNs / NANOSECS_TO_MILLISECS)
}

export const TIMEOUT_ERROR =
  'timed out. Please increase the "duration" configuration property.'

const NANOSECS_TO_MILLISECS = 1e6
