import { UserError } from '../error/main.js'

// Get previous results index by result delta
export const find = function (results, { type, value, original, name }) {
  if (results.length === 0) {
    throw new UserError(
      `Invalid "${name}" configuration property "${original}": no previous results`,
    )
  }

  const index = QUERIES[type](results, value)

  if (index === undefined) {
    throw new UserError(
      `Invalid "${name}" configuration property "${original}": no matching results`,
    )
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

const findById = function (results, id) {
  return results.find((result) => result.id === id)
}

const QUERIES = {
  count: findByCount,
  timestamp: findByTimestamp,
  id: findById,
}
