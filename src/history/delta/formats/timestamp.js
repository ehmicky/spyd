// Deltas can be dates or times.
// We use `new Date()` which means:
//  - can specify only the date, or both date and time
//  - can omit timezone (default to local timezone) but returned date is UTC
//  - loose parsing
const parseTimestamp = function (delta) {
  if (typeof delta !== 'string') {
    return
  }

  const timestamp = Number(new Date(delta))

  if (Number.isNaN(timestamp)) {
    return
  }

  return timestamp
}

const findByTimestamp = function (results, timestamp) {
  return results.findIndex((result) => result.timestamp >= timestamp)
}

export const timestampFormat = {
  type: 'timestamp',
  message: 'date or time',
  parse: parseTimestamp,
  find: findByTimestamp,
}
