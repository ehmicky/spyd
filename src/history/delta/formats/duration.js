import { findByTime } from './find.js'

// Deltas can be durations.
const parseDuration = (delta) => {
  if (typeof delta !== 'string') {
    return
  }

  const parts = DURATION_REGEXP.exec(delta)

  if (parts === null) {
    return
  }

  const [, amount, unit] = parts
  const seconds = DURATION_UNITS[unit]

  if (seconds === undefined) {
    return
  }

  return amount * seconds
}

const DURATION_REGEXP = /^(\d+)\s*([a-z]+)$/iu

/* eslint-disable id-length */
const DURATION_UNITS = {
  s: 1e3,
  second: 1e3,
  seconds: 1e3,
  m: 6e4,
  minute: 6e4,
  minutes: 6e4,
  h: 36e5,
  hour: 36e5,
  hours: 36e5,
  d: 864e5,
  day: 864e5,
  days: 864e5,
  month: 26_352e5,
  months: 26_352e5,
  y: 31_536e6,
  year: 31_536e6,
  years: 31_536e6,
}
/* eslint-enable id-length */

const findByDuration = (metadataGroups, duration) => {
  const timestamp = Date.now() - duration
  return findByTime(metadataGroups, timestamp)
}

export const durationFormat = {
  type: 'duration',
  message: 'duration',
  parse: parseDuration,
  find: findByDuration,
}
