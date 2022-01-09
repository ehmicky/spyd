import { UserError } from '../../error/main.js'

// Parse the `limit` configuration property.
// It is an integer representing a percentage.
// Negative values can be used, including -0, to invert the direction.
export const parseLimit = function (limit) {
  if (!Number.isInteger(limit)) {
    throw new UserError(
      `The 'limit' configuration property's percentage must be an integer: ${limit}`,
    )
  }

  const higher = limit > 0 || Object.is(limit, 0)
  const threshold = limit / PERCENTAGE_RATIO
  return { threshold, higher }
}

const PERCENTAGE_RATIO = 1e2
