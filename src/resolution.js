import { now } from './now.js'

// Retrieve system's time resolution in nanoseconds.
// If the resolution is <1ns, returns 1ns.
// This does not work if `now()` is slower than the time resolution, but this
// should not be the case.
// Time resolution depends on a combination of hardware and software factors.
export const getTimeResolution = function() {
  const times = getTimes(REPEAT)
  return POSSIBLE_RESOLUTIONS.find(resolution =>
    isTimeResolution(resolution, times),
  )
}

// Run `now()` several times in a row
const getTimes = function(length) {
  const times = Array.from({ length }, now)
  const uniqueTimes = [...new Set(times)]
  return uniqueTimes
}

const REPEAT = 1e2

// Check among all `now()` if they fit a specific time resolution
const isTimeResolution = function(resolution, times) {
  // Performance optimization. Avoid looping over every `times`
  if (resolution === MIN_RESOLUTION) {
    return true
  }

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
  // eslint-disable-next-line no-magic-numbers
  const scale = 10 ** exponent
  // eslint-disable-next-line no-magic-numbers
  return [5 * scale, scale]
}

const POSSIBLE_RESOLUTIONS = getPossibleResolutions()

// 1 nanosecond
const MIN_RESOLUTION = POSSIBLE_RESOLUTIONS[POSSIBLE_RESOLUTIONS.length - 1]
