import { UserError } from '../../error/main.js'

// Parse the `limit` configuration property.
// It is an integer representing a percentage.
export const parseLimit = function (limit) {
  if (!Number.isInteger(limit)) {
    throw new UserError(
      `The 'limit' configuration property's percentage must be an integer: ${limit}`,
    )
  }

  return limit / PERCENTAGE_RATIO
}

const PERCENTAGE_RATIO = 1e2

// Negative values can be used, including -0, to invert the direction.
export const isNegativeLimit = function (limit) {
  return limit < 0 || Object.is(limit, -0)
}
