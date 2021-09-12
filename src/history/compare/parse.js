import { UserError } from '../../error/main.js'
import { parseSelectors } from '../../select/parse.js'

// Parse the `limit` configuration property.
// It is an array of strings "threshold selector" where "threshold" is
// something like "15%" and "selector" follows the same format as each
// individual string in the `select` configuration property.
export const parseLimits = function (limit) {
  // eslint-disable-next-line fp/no-mutating-methods
  return limit.map(parseLimit).sort(sortByThreshold)
}

const parseLimit = function (singleLimit) {
  const [rawPercentage, ...rawGroups] = tokenizeLimit(singleLimit)
  const { threshold, higher } = parsePercentage(rawPercentage)
  const selectors = parseLimitSelectors(rawGroups)
  return { threshold, higher, selectors }
}

const tokenizeLimit = function (singleLimit) {
  return singleLimit.trim().split(TOKEN_DELIMITER_REGEX)
}

const TOKEN_DELIMITER_REGEX = /\s+/gu

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

const parseLimitSelectors = function (rawGroups) {
  const rawSelector = rawGroups.join(' ')
  const selectors = parseSelectors([rawSelector], 'limit')
  return selectors
}

// Higher threshold are checked for matches first
const sortByThreshold = function (
  { threshold: thresholdA },
  { threshold: thresholdB },
) {
  return thresholdB - thresholdA
}
