import { UserError } from '../../error/main.js'

// Delta can an integer, to find the {integer}-th last result.
// Default deltas are 1, i.e. last result.
export const parseCount = function (delta) {
  if (typeof delta !== 'number') {
    return
  }

  if (!Number.isInteger(delta) || delta < 1) {
    throw new UserError('must be a positive integer')
  }

  return delta
}

export const findByCount = function (results, count) {
  if (count > results.length) {
    return
  }

  return count - 1
}
