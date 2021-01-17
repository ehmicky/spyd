// Deltas can be dates or times.
// We use `new Date()` which means:
//  - can specify only the date, or both date and time
//  - can omit timezone (default to local timezone) but returned date is UTC
//  - loose parsing
const parseTimestamp = function (delta) {
  if (Number.isNaN(Number(new Date(delta)))) {
    return
  }

  const deltaA = normalizeDayOnly(delta)
  const timestamp = new Date(deltaA).toISOString()
  return timestamp
}

// When specifying only the day, we default to the end of the day not the
// beginning. `new Date()` does the opposite, so we need to fix it.
const normalizeDayOnly = function (delta) {
  if (!DAY_REGEXP.test(delta)) {
    return delta
  }

  return `${delta} 23:59:59.999`
}

// Matches yyyy-mm-dd with any delimiters before yyyy, mm and dd, but no
// hours/minutes/seconds afterwards. This works with some local formats too
// such as mm/dd/yyyy
const DAY_REGEXP = /^[^\d]*\d+[^\d]*\d+[^\d]*\d+[^\d]*$/u

const findByTimestamp = function (results, timestamp) {
  const index = results.findIndex((result) => result.timestamp <= timestamp)

  if (index === -1) {
    return
  }

  return index
}

export const timestampFormat = {
  type: 'timestamp',
  parse: parseTimestamp,
  find: findByTimestamp,
}
