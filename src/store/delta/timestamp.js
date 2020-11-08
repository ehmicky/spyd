import { UserError } from '../../error/main.js'

// We use `new Date()` which means:
//  - can specify only the date, or both date and time
//  - can omit timezone (default to local timezone) but returned date is UTC
//  - loose parsing
export const getDeltaTimestamp = function (name, delta) {
  const deltaA = normalizeDayOnly(delta)

  const date = new Date(deltaA)

  if (Number.isNaN(Number(date))) {
    throw new UserError(`'${name}' option is an invalid date/time: ${delta}`)
  }

  const dateA = normalizeDateTime(date)
  return dateA
}

// When specifying only the day, we default to the end of the day not the
// beginning. `new Date()` does the opposite, so we need to fix it.
const normalizeDayOnly = function (delta) {
  if (!DAY_REGEXP.test(delta)) {
    return delta
  }

  return `${delta} 23:59:59`
}

// Matches yyyy-mm-dd with any delimiters before yyyy, mm and dd, but no
// hours/minutes/seconds afterwards. This works with some local formats too
// such as mm/dd/yyyy
const DAY_REGEXP = /^[^\d]*\d+[^\d]*\d+[^\d]*\d+[^\d]*$/u

// When specifying day and time, we default to the end of the second not the
// beginning. `new Date()` does the opposite, so we need to fix it.
const normalizeDateTime = function (date) {
  return new Date(Number(date) + SECS_TO_MILLISECS - 1)
}

const SECS_TO_MILLISECS = 1e3
