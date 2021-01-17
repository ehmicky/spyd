import { UserError } from '../error/main.js'

import { isDeltaTimestamp, getDeltaTimestamp } from './timestamp.js'

// Several configuration properties targets a previous results using either a
// boolean, an integer or a timestamp. We normalize to a `query` object that
// stores can use. We also validate it.
export const normalizeDelta = function (delta, name) {
  try {
    const deltaA = eNormalizeDelta(delta)
    return { ...deltaA, original: delta, name }
  } catch (error) {
    error.message = `"${name}" configuration property ${error.message}: ${delta}`
    throw error
  }
}

const eNormalizeDelta = function (delta) {
  if (typeof delta === 'number') {
    return getDeltaNumber(delta)
  }

  if (isDeltaTimestamp(delta)) {
    return getDeltaTimestamp(delta)
  }

  throw new UserError('must be a number, a date or a time')
}

const getDeltaNumber = function (delta) {
  if (!Number.isInteger(delta) || delta < 1) {
    throw new UserError('must be a positive integer')
  }

  return { type: 'count', value: delta }
}
