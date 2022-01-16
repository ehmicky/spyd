import { UserError } from '../../error/main.js'
import { findValue } from '../../utils/find.js'

import { getDeltaProp, addDeltaError } from './error.js'
import { FORMATS } from './formats/main.js'

// Several configuration properties targets a previous rawResult using a delta,
// which can an integer, date/time/duration, rawResult.id or git reference.
export const normalizeDeltas = function (config) {
  return DELTA_PROPS.reduce(normalizeDelta, config)
}

const DELTA_PROPS = ['delta', 'since']

const normalizeDelta = function (config, name) {
  const delta = config[name]

  if (delta === undefined) {
    return config
  }

  return { ...config, [name]: normalizeDeltaValue(delta, name) }
}

const normalizeDeltaValue = function (delta, name) {
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
      `${deltaProp} must be a number, a date, a time, an id or a git commit/tag/branch.`,
    )
  }

  const [value, { type }] = deltaReturn
  return { type, value, delta, name }
}

const parseDelta = function ({ format: { parse, type }, delta, name }) {
  try {
    return parse(delta)
  } catch (error) {
    throw addDeltaError(error, { type, delta, name })
  }
}
