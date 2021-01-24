import { UserError } from '../error/main.js'
import { findValue } from '../utils/find.js'

import { ciFormat } from './formats/ci.js'
import { commitFormat } from './formats/commit.js'
import { countFormat } from './formats/count.js'
import { firstFormat } from './formats/first.js'
import { idFormat } from './formats/id.js'
import { tagFormat } from './formats/tag.js'
import { timestampFormat } from './formats/timestamp.js'

// Several configuration properties targets a previous results using a delta,
// which can an integer, date/time, result.id or git commit.
// Previous results are always first filtered by `include`/`exclude`.
// This validates and normalizes it to a `deltaQuery` object.
export const normalizeDelta = function (delta, name, envInfo) {
  if (delta === '') {
    throw new UserError(
      `"${name}" configuration property "${delta}" must not be an empty string`,
    )
  }

  const deltaReturn = findValue(FORMATS, (format) =>
    parseDelta({ format, delta, name, envInfo }),
  )

  if (deltaReturn === undefined) {
    throw new UserError(
      `"${name}" configuration property "${delta}" must be a number, a date, a time, an id or a git commit/tag/branch.`,
    )
  }

  const [value, { type }] = deltaReturn
  return { type, value, original: delta, name }
}

const parseDelta = function ({
  format: { parse, message },
  delta,
  name,
  envInfo,
}) {
  try {
    return parse(delta, envInfo)
  } catch (error) {
    error.message = `"${name}" configuration property "${delta}" (${message}) ${error.message}.`
    throw error
  }
}

// Get previous results index by result delta.
// `results` must be sorted from most to least recent.
export const findByDelta = async function (
  results,
  { type, value, original, name },
) {
  if (results.length === 0) {
    throw new UserError('No previous results')
  }

  const { find, message } = FORMATS.find((format) => format.type === type)

  try {
    return await findResult(find, results, value)
  } catch (error) {
    error.message = `"${name}" configuration property "${original}" (${message}) ${error.message}.`
    throw error
  }
}

const findResult = async function (find, results, value) {
  const index = await find(results, value)

  if (index === -1) {
    throw new UserError('matches no results')
  }

  return index
}

// Order matters since the first successful parse() is used
const FORMATS = [
  countFormat,
  firstFormat,
  timestampFormat,
  idFormat,
  ciFormat,
  commitFormat,
  tagFormat,
]
