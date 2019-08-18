// Several options targets a previous benchmarks using either a boolean, an
// integer or a timestamp. We normalize to a `query` object that stores can use.
// We also validate it.
export const getBenchmarkDelta = function(name, delta) {
  if (delta === false) {
    return
  }

  const deltaA = getDelta(name, delta)
  const { queryType, queryValue } = getQuery(deltaA)
  return { queryType, queryValue }
}

const getDelta = function(name, delta) {
  if (delta === true) {
    return 1
  }

  if (typeof delta === 'number') {
    return getDeltaNumber(name, delta)
  }

  return getDeltaTimestamp(name, delta)
}

const getDeltaNumber = function(name, delta) {
  if (!Number.isInteger(delta) || delta < 1) {
    throw new TypeError(`'${name}' option must be a positive integer: ${delta}`)
  }

  return delta
}

// We use `new Date()` which means:
//  - can specify only the date, or both date and time
//  - can omit timezone (default to local timezone) but returned date is UTC
//  - loose parsing
const getDeltaTimestamp = function(name, delta) {
  const deltaA = normalizeDayOnly(delta)

  const date = new Date(deltaA)

  if (isNaN(date)) {
    throw new TypeError(`'${name}' option is an invalid date/time: ${delta}`)
  }

  const dateA = normalizeDateTime(date)
  return dateA
}

// When specifying only the day, we default to the end of the day not the
// beginning. `new Date()` does the opposite, so we need to fix it.
const normalizeDayOnly = function(delta) {
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
const normalizeDateTime = function(date) {
  return new Date(Number(date) + SECS_TO_MILLISECS - 1)
}

const SECS_TO_MILLISECS = 1e3

// Normalize to a query object for the stores
const getQuery = function(delta) {
  if (Number.isInteger(delta)) {
    return { queryType: 'count', queryValue: delta }
  }

  const queryValue = delta.toISOString()
  return { queryType: 'timestamp', queryValue }
}
