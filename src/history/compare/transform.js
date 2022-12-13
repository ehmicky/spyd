// Parse the `limit` configuration property.
// It is an integer representing a percentage.
export const transformLimit = (limit) => limit / PERCENTAGE_RATIO

const PERCENTAGE_RATIO = 1e2

// Negative values can be used, including -0, to invert the direction.
export const isNegativeLimit = (limit) => limit < 0 || Object.is(limit, -0)

export const EXAMPLE_LIMIT = 10
