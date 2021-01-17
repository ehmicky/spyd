import { UserError } from '../error/main.js'
import { findValue } from '../utils/find.js'

import { commitFormat } from './formats/commit.js'
import { countFormat } from './formats/count.js'
import { idFormat } from './formats/id.js'
import { tagFormat } from './formats/tag.js'
import { timestampFormat } from './formats/timestamp.js'

// Several configuration properties targets a previous results using a delta,
// which can an integer, date/time, result.id or git commit.
// This validates and normalizes it to a `deltaQuery` object.
export const normalizeDelta = function (delta, name) {
  if (delta === '') {
    throw new UserError(
      `"${name}" configuration property "${delta}" must not be an empty string`,
    )
  }

  const deltaReturn = findValue(FORMATS, (format) =>
    parseDelta(format, delta, name),
  )

  if (deltaReturn === undefined) {
    throw new UserError(
      `"${name}" configuration property "${delta}" must be a number, a date, a time, an id or a git commit/tag/branch.`,
    )
  }

  const [value, { type }] = deltaReturn
  return { type, value, original: delta, name }
}

const parseDelta = function ({ parse, message }, delta, name) {
  try {
    return parse(delta)
  } catch (error) {
    error.message = `"${name}" configuration property "${delta}" (${message}) ${error.message}.`
    throw error
  }
}

// Get previous results index by result delta.
// `results` must be sorted from most to least recent.
export const findByDelta = function (results, { type, value, original, name }) {
  if (results.length === 0) {
    throw new UserError('No previous results')
  }

  const { find, message } = FORMATS.find((format) => format.type === type)
  const index = find(results, value)

  if (index === undefined) {
    throw new UserError(
      `Invalid "${name}" configuration property "${original}" (${message}): no matching results.`,
    )
  }

  return index
}

// Order matters since the first successful parse() is used
const FORMATS = [
  countFormat,
  timestampFormat,
  idFormat,
  commitFormat,
  tagFormat,
]
