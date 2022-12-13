import { UserError } from '../../../error/main.js'

// Delta can be an integer, to find the {integer}-th last rawResult.
// Can be 0 to target no results.
// Default deltas are 1, i.e. last rawResult.
const parseCount = (delta) => {
  if (typeof delta !== 'number') {
    return
  }

  if (!Number.isInteger(delta) || delta < 0) {
    throw new UserError('must be a positive integer.')
  }

  return delta
}

const findByCount = (metadataGroups, count) => {
  if (count === 0) {
    return -1
  }

  const index = metadataGroups.length - count

  if (index < 0) {
    return 0
  }

  return index
}

export const countFormat = {
  type: 'count',
  message: 'count',
  parse: parseCount,
  find: findByCount,
}
