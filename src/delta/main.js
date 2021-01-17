import { UserError } from '../error/main.js'
import { findValue } from '../utils/find.js'

import { parseCount, findByCount } from './formats/count.js'
import { parseCommit, findByCommit } from './formats/git.js'
import { parseId, findById } from './formats/id.js'
import { parseTimestamp, findByTimestamp } from './formats/timestamp.js'

// Several configuration properties targets a previous results using a delta,
// which can an integer, date/time, result.id or git commit.
// This validates and normalizes it to a `deltaQuery` object.
export const normalizeDelta = function (delta, name) {
  try {
    const deltaQuery = getDeltaQuery(delta)
    return { ...deltaQuery, original: delta, name }
  } catch (error) {
    error.message = `"${name}" configuration property ${error.message}: ${delta}`
    throw error
  }
}

const getDeltaQuery = function (delta) {
  const deltaReturn = findValue(DELTA_FORMATS, ({ parse }) => parse(delta))

  if (deltaReturn === undefined) {
    throw new UserError(
      'must be a number, a date, a time, an id or a git commit',
    )
  }

  const [value, { type }] = deltaReturn
  return { type, value }
}

// Get previous results index by result delta
export const findByDelta = function (results, { type, value, original, name }) {
  if (results.length === 0) {
    throw new UserError('No previous results')
  }

  const { find } = DELTA_FORMATS.find(
    (deltaFormat) => deltaFormat.type === type,
  )
  const index = find(results, value)

  if (index === undefined) {
    throw new UserError(
      `Invalid "${name}" configuration property "${original}" (${type}): no matching results`,
    )
  }

  return index
}

// Order matters since the first successful parse() is used
const DELTA_FORMATS = [
  { type: 'count', parse: parseCount, find: findByCount },
  { type: 'timestamp', parse: parseTimestamp, find: findByTimestamp },
  { type: 'id', parse: parseId, find: findById },
  { type: 'commit', parse: parseCommit, find: findByCommit },
]
