import { UserError } from '../../error/main.js'
import { findValue } from '../../utils/find.js'

import { getDeltaProp, addDeltaError } from './error.js'
import { FORMATS } from './formats/main.js'

// Several configuration properties targets a previous rawResult using a delta,
// which can an integer, "first", date/time/duration, rawResult.id or git
// reference.
export const transformDelta = function (delta, { name }) {
  if (delta === '') {
    const deltaProp = getDeltaProp(delta, name)
    throw new UserError(`${deltaProp} must not be an empty string`)
  }

  const deltaReturn = findValue(FORMATS, (format) =>
    parseDelta({ format, delta, name }),
  )

  if (deltaReturn === undefined) {
    const deltaProp = getDeltaProp(delta, name)
    throw new UserError(
      `${deltaProp} must be an integer, "first", a date/time/duration, a result id or a git commit/tag/branch.`,
    )
  }

  const { type, value } = deltaReturn
  return { type, value, delta, name }
}

const parseDelta = function ({ format: { parse, type }, delta, name }) {
  try {
    const value = parse(delta)
    return value === undefined ? undefined : { type, value }
  } catch (error) {
    throw addDeltaError(error, { type, delta, name })
  }
}
