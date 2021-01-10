import { UserError } from '../error/main.js'
import { matchSelector } from '../select/match.js'
import { parseSelector, getCatchAllSelector } from '../select/parse.js'

// Add `combination.limit` to each combination using the `limit` property
export const addLimits = function (combinations, limit) {
  const limitMatchers = getLimitMatchers(limit, combinations)
  return combinations.map((combination) =>
    addCombinationLimits(combination, limitMatchers),
  )
}

// Parse the `limit` configuration property.
// It is an array of strings "percentage selector" where "percentage" is
// something like "15%" and "selector" follows the same format as each
// individual string in the `include` configuration property.
const getLimitMatchers = function (limit, combinations) {
  // eslint-disable-next-line fp/no-mutating-methods
  return limit
    .map((singleLimit) => getLimitMatcher(singleLimit, combinations))
    .sort(sortByPercentage)
}

const getLimitMatcher = function (singleLimit, combinations) {
  const [rawPercentage, ...rawGroups] = singleLimit
    .trim()
    .split(PERCENT_SEPARATOR_REGEXP)
  const percentage = getPercentage(rawPercentage)
  const selector = parseLimitSelector(rawGroups, combinations)
  return { percentage, selector }
}

const PERCENT_SEPARATOR_REGEXP = /\s+/u

const getPercentage = function (rawPercentage) {
  const percentageStr = rawPercentage.replace(PERCENTAGE_REGEXP, '')

  if (rawPercentage === percentageStr) {
    throw new UserError(
      `The 'limit' configuration property must start with a percentage ending with %: ${rawPercentage}`,
    )
  }

  const percentage = Number(percentageStr)

  if (!Number.isInteger(percentage) || percentage < 0) {
    throw new UserError(
      `The 'limit' configuration property's percentage must be a positive integer: ${rawPercentage}`,
    )
  }

  return percentage
}

const PERCENTAGE_REGEXP = /%$/u

const parseLimitSelector = function (rawGroups, combinations) {
  if (rawGroups.length === 0) {
    return getCatchAllSelector()
  }

  const rawSelector = rawGroups.join(' ')
  const selector = parseSelector(rawSelector, 'limit', combinations)
  return selector
}

// Higher percentages are checked for matches first
const sortByPercentage = function (
  { percentage: percentageA },
  { percentage: percentageB },
) {
  return percentageB - percentageA
}

// Add `combination.limit` when matching a `limit`
const addCombinationLimits = function (combination, limitMatchers) {
  const limitMatcher = limitMatchers.find(({ selector }) =>
    matchSelector(combination, selector),
  )

  if (limitMatcher === undefined) {
    return combination
  }

  return { ...combination, limitPercentage: limitMatcher.percentage }
}
