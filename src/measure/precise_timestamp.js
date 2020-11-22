import { performance } from 'perf_hooks'

// Returns a Unix timestamp with high resolution.
// The unit is in nanoseconds. The actual resolution depends on the resolution
// of `performance.now()` which varies on:
//  - the OS: on Windows, it is often 100ns but on Unix it is often 1ns
//  - the platform: browser limit the highest resolution for security reasons
//    (timing attacks)
//  - the machine maximum resolution
// Unlike `precise-now`, this returns Unix timestamps so this can be used to
// compare timestamps between different processes
// This does not use:
//  - `Date.now()`: its resolution is only 1ms
//  - `process.hrtime()`: they do not return Unix timestamps
export const preciseTimestamp = function () {
  return (
    milliToNanoseconds(performance.timeOrigin) +
    milliToNanoseconds(performance.now())
  )
}

// We use `BigInt` to prevent rounding errors
const milliToNanoseconds = function (timeMs) {
  return BigInt(Math.round(timeMs * MILLI_TO_NANOSECS))
}

const MILLI_TO_NANOSECS = 1e6
