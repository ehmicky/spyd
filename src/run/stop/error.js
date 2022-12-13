import { StopError } from '../../error/main.js'

// Throws on graceful stops.
// Not done if a user exception was thrown
export const throwIfStopped = ({ stopped }) => {
  if (!stopped) {
    return
  }

  throw new StopError('Benchmark has been stopped.')
}

export const throwAbortError = () => {
  throw new StopError('Benchmark has been aborted.')
}
