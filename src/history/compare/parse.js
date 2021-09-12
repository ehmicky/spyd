import { UserError } from '../../error/main.js'
import { parseSelectors } from '../../select/parse.js'

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
  const { threshold, higher } = parsePercentage(rawPercentage)
  const selectors = parseLimitSelectors(rawGroups, combinations)
  return { threshold, higher, selectors }
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

  if (!Number.isInteger(threshold)) {
    throw new UserError(
      `The 'limit' configuration property's percentage must be an integer: ${rawPercentage}`,
    )
  }

  const higher = threshold > 0
  const thresholdA = Math.abs(threshold) / PERCENTAGE_RATIO
  return { threshold: thresholdA, higher }
}

const PERCENTAGE_REGEXP = /%$/u
const PERCENTAGE_RATIO = 1e2

const parseLimitSelectors = function (rawGroups, combinations) {
  const rawSelector = rawGroups.join(' ')
  const selectors = parseSelectors([rawSelector], 'limit', combinations)
  return selectors
}

// Higher threshold are checked for matches first
const sortByThreshold = function (
  { threshold: thresholdA },
  { threshold: thresholdB },
) {
  return thresholdB - thresholdA
}
