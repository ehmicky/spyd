import { UserError } from '../../error/main.js'

import { getDeltaTimestamp } from './timestamp.js'

// Several configuration properties targets a previous results using either a
// boolean, an integer or a timestamp. We normalize to a `query` object that
// stores can use. We also validate it.
export const normalizeDelta = function (name, delta) {
  if (delta === false) {
    return
  }

  const deltaA = getDelta(name, delta)
  const { queryType, queryValue } = getQuery(deltaA)
  return { queryType, queryValue }
}

const getDelta = function (name, delta) {
  if (delta === true) {
    return 1
  }

  if (typeof delta === 'number') {
    return getDeltaNumber(name, delta)
  }

  return getDeltaTimestamp(name, delta)
}

const getDeltaNumber = function (name, delta) {
  if (!Number.isInteger(delta) || delta < 1) {
    throw new UserError(
      `'${name}' configuration property must be a positive integer: ${delta}`,
    )
  }

  return delta
}

// Normalize to a query object for the stores
const getQuery = function (delta) {
  if (Number.isInteger(delta)) {
    return { queryType: 'count', queryValue: delta }
  }

  const queryValue = delta.toISOString()
  return { queryType: 'timestamp', queryValue }
}
