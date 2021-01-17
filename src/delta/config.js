import { validate as isUuid } from 'uuid'

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

  if (isUuid(delta)) {
    return getDeltaId(delta)
  }

  if (isDeltaCommit(delta)) {
    return getDeltaCommit(delta)
  }

  throw new UserError('must be a number, a date or a time')
}

const getDeltaNumber = function (delta) {
  if (!Number.isInteger(delta) || delta < 1) {
    throw new UserError('must be a positive integer')
  }

  return { type: 'count', value: delta }
}

const getDeltaId = function (delta) {
  return { type: 'id', value: delta }
}

const isDeltaCommit = function (delta) {
  return GIT_COMMIT_REGEXP.test(delta)
}

// Git commit hash at least 8 characters long
const GIT_COMMIT_REGEXP = /^[\da-f]{8,}$/iu

const getDeltaCommit = function (delta) {
  return { type: 'commit', value: delta }
}
