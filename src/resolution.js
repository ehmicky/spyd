import { now } from './now.js'

// Retrieve system's time resolution in nanoseconds.
// If the resolution is <1ns, returns 1ns.
// Time resolution depends on a combination of hardware and software factors.
export const getTimeResolution = function() {
  const times = getTimes(REPEAT)
  return POSSIBLE_RESOLUTIONS.find(resolution =>
    isTimeResolution(resolution, times),
  )
}

// Run `now()` several times in a row.
// We do it several times because there is a chance that the next resolution
// would be hit otherwise. For example:
//  - if resolution is 1ns, samples might (by chance) all be modulo 5ns
//  - if resolution is 5ns, samples might (by chance) all be modulo 10ns
// The probability for this to happen is:
//  - if resolution is *1ns, `1 / 5 ** length`
//  - if resolution is *5ns, `1 / 2 ** length`
// So with `length` `100`, we get this error only once every `1e30` calls.
// We must use imperative code because the loop size is unknown.
/* eslint-disable fp/no-let, fp/no-loops, fp/no-mutation, fp/no-mutating-methods,
max-depth */
const getTimes = function(length) {
  const times = []
  let lastTime = 0

  while (times.length < length) {
    const time = now()

    // If the resolution is very low, we need to perform `now()` several times
    // until the result changes
    if (time !== lastTime) {
      lastTime = time
      times.push(time)
    }
  }

  return times
}
/* eslint-enable fp/no-let, fp/no-loops, fp/no-mutation, fp/no-mutating-methods,
max-depth */

const REPEAT = 1e2

// Check among all `now()` if they fit a specific time resolution
const isTimeResolution = function(resolution, times) {
  return times.every(time => time % resolution === 0)
}

// Available time resolutions from 50ms, 10ms, 5ms, ... to 1ns.
// In nanoseconds.
const getPossibleResolutions = function() {
  return Array.from({ length: MAX_RESOLUTION_EXPONENT }, getExponent).flatMap(
    getPossibleResolution,
  )
}

// 8 digits after nanoseconds, i.e. 99ms-10ms
const MAX_RESOLUTION_EXPONENT = 8

const getExponent = function(value, index) {
  return MAX_RESOLUTION_EXPONENT - index - 1
}

const getPossibleResolution = function(exponent) {
  const scale = 10 ** exponent
  // eslint-disable-next-line no-magic-numbers
  return [5 * scale, scale]
}

const POSSIBLE_RESOLUTIONS = getPossibleResolutions()
