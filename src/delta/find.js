import { UserError } from '../error/main.js'

// Get previous results index by result delta
export const find = function (results, { queryType, queryValue }) {
  if (results.length === 0) {
    throw new UserError('No previous results')
  }

  const index = QUERIES[queryType](results, queryValue)

  if (index === undefined) {
    throw new UserError('No matching results')
  }

  return index
}

const findByCount = function (results, count) {
  if (count > results.length) {
    return
  }

  return count - 1
}

const findByTimestamp = function (results, timestamp) {
  const index = results.findIndex((result) => result.timestamp <= timestamp)

  if (index === -1) {
    return
  }

  return index
}

const QUERIES = {
  count: findByCount,
  timestamp: findByTimestamp,
}
