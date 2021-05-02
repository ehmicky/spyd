import { UserError } from '../error/main.js'
import { parseSelector, getCatchAllSelector } from '../select/parse.js'

// Parse the `limit` configuration property.
// It is an array of strings "threshold selector" where "threshold" is
// something like "15%" and "selector" follows the same format as each
// individual string in the `select` configuration property.
export const parseLimits = function (limit, combinations) {
  // eslint-disable-next-line fp/no-mutating-methods
  return limit
    .map((singleLimit) => parseLimit(singleLimit, combinations))
    .sort(sortByThreshold)
}

const parseLimit = function (singleLimit, combinations) {
  const [rawPercentage, ...rawGroups] = singleLimit
    .trim()
    .split(PERCENT_SEPARATOR_REGEXP)
  const threshold = parsePercentage(rawPercentage)
  const selector = parseLimitSelector(rawGroups, combinations)
  return { threshold, selector }
}

const PERCENT_SEPARATOR_REGEXP = /\s+/u

const parsePercentage = function (rawPercentage) {
  const percentage = rawPercentage.replace(PERCENTAGE_REGEXP, '')

  if (rawPercentage === percentage) {
    throw new UserError(
      `The 'limit' configuration property must start with a percentage ending with %: ${rawPercentage}`,
    )
  }

  const threshold = Number(percentage)

  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new UserError(
      `The 'limit' configuration property's percentage must be a positive integer: ${rawPercentage}`,
    )
  }

  return threshold / PERCENTAGE_RATIO
}

const PERCENTAGE_REGEXP = /%$/u
const PERCENTAGE_RATIO = 1e2

const parseLimitSelector = function (rawGroups, combinations) {
  if (rawGroups.length === 0) {
    return getCatchAllSelector()
  }

  const rawSelector = rawGroups.join(' ')
  const selector = parseSelector(rawSelector, 'limit', combinations)
  return selector
}

// Higher threshold are checked for matches first
const sortByThreshold = function (
  { threshold: thresholdA },
  { threshold: thresholdB },
) {
  return thresholdB - thresholdA
}
