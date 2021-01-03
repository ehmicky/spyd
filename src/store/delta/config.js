import { UserError } from '../../error/main.js'

import { getDeltaTimestamp } from './timestamp.js'

// Several configuration properties targets a previous results using either a
// boolean, an integer or a timestamp. We normalize to a `query` object that
// stores can use. We also validate it.
export const normalizeDelta = function (delta, name) {
  if (delta === false) {
    return
  }

  const deltaA = getDelta(delta, name)
  const { queryType, queryValue } = getQuery(deltaA)
  return { queryType, queryValue }
}

const getDelta = function (delta, name) {
  if (delta === true) {
    return 1
  }

  if (typeof delta === 'number') {
    return getDeltaNumber(delta, name)
  }

  return getDeltaTimestamp(delta, name)
}

const getDeltaNumber = function (delta, name) {
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
