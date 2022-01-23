import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { findValue } from '../../utils/find.js'

import { getDeltaTypeMessage } from './error.js'
import { FORMATS } from './formats/main.js'

// Several configuration properties targets a previous rawResult using a delta,
// which can an integer, "first", date/time/duration, rawResult.id or git
// reference.
export const transformDelta = function (delta, { name }) {
  if (delta === '') {
    throw new UserError('must not be an empty string.')
  }

  const deltaReturn = findValue(FORMATS, (format) => parseDelta(format, delta))

  if (deltaReturn === undefined) {
    throw new UserError(
      'must be an integer, "first", a date/time/duration, a result id or a git commit/tag/branch.',
    )
  }

  const { type, value } = deltaReturn
  return { type, value, delta, name }
}

const parseDelta = function ({ parse, type }, delta) {
  try {
    const value = parse(delta)
    return value === undefined ? undefined : { type, value }
  } catch (error) {
    throw wrapError(error, getDeltaTypeMessage(type))
  }
}
