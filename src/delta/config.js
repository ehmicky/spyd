import { validate as isUuid } from 'uuid'

import { UserError } from '../error/main.js'
import { findValue } from '../utils/find.js'

import { getDeltaTimestamp } from './timestamp.js'

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
  const deltaReturn = findValue(Object.entries(TYPES), ([, getDeltaFunc]) =>
    getDeltaFunc(delta),
  )

  if (deltaReturn === undefined) {
    throw new UserError(
      'must be a number, a date, a time, an id or a git commit',
    )
  }

  const [value, [type]] = deltaReturn
  return { type, value }
}

const getDeltaCount = function (delta) {
  if (typeof delta !== 'number') {
    return
  }

  if (!Number.isInteger(delta) || delta < 1) {
    throw new UserError('must be a positive integer')
  }

  return delta
}

const getDeltaId = function (delta) {
  if (!isUuid(delta)) {
    return
  }

  return delta
}

const getDeltaCommit = function (delta) {
  if (!GIT_COMMIT_REGEXP.test(delta)) {
    return
  }

  return delta
}

// Git commit hash at least 8 characters long
const GIT_COMMIT_REGEXP = /^[\da-f]{8,}$/iu

const TYPES = {
  count: getDeltaCount,
  id: getDeltaId,
  timestamp: getDeltaTimestamp,
  commit: getDeltaCommit,
}
