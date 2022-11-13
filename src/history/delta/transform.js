import { BaseError } from '../../error/main.js'
import { findValue } from '../../utils/find.js'

import { getDeltaTypeMessage } from './error.js'
import { FORMATS } from './formats/main.js'

// Several configuration properties targets a previous rawResult using a delta,
// which can an integer, "first", date/time/duration, rawResult.id or git
// reference.
export const transformDelta = function (deltaOriginal) {
  if (deltaOriginal === '') {
    throw new Error('must not be an empty string.')
  }

  const deltaReturn = findValue(FORMATS, (format) =>
    parseDelta(format, deltaOriginal),
  )

  if (deltaReturn === undefined) {
    throw new Error(
      'must be an integer, "first", a date/time/duration, a result id or a git commit/tag/branch.',
    )
  }

  const { type, value } = deltaReturn
  return { type, value, original: deltaOriginal }
}

const parseDelta = function ({ parse, type }, deltaOriginal) {
  try {
    const value = parse(deltaOriginal)
    return value === undefined ? undefined : { type, value }
  } catch (cause) {
    throw new BaseError(`must be a valid ${getDeltaTypeMessage(type)}.`, {
      cause,
    })
  }
}

export const DEFAULT_MAIN_DELTA = 1
export const DEFAULT_SINCE_DELTA = 1
