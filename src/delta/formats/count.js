import { UserError } from '../../error/main.js'

// Delta can be an integer, to find the {integer}-th last result.
// Default deltas are 1, i.e. last result.
const parseCount = function (delta) {
  if (typeof delta !== 'number') {
    return
  }

  if (!Number.isInteger(delta) || delta < 1) {
    throw new UserError('must be a positive integer')
  }

  return delta
}

const findByCount = function (results, count) {
  if (count > results.length) {
    return
  }

  return count - 1
}

export const countFormat = {
  type: 'count',
  message: 'count',
  parse: parseCount,
  find: findByCount,
}
