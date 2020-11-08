import { UserError } from '../error/main.js'

// Normalize 'limit' option
export const normalizeLimits = function (limits) {
  return limits.map(normalizeLimit)
}

const normalizeLimit = function (limit) {
  const parts = limit.split(SEPARATOR)
  const ids = parts.slice(0, -1).filter(Boolean)
  const percentage = getPercentage(parts[parts.length - 1])
  return { ids, percentage }
}

const SEPARATOR = ':'

const getPercentage = function (originalPercentage) {
  const percentageStr = originalPercentage.replace(PERCENTAGE_REGEXP, '')

  if (originalPercentage === percentageStr) {
    throw new UserError(`'limit' must end with %: ${originalPercentage}`)
  }

  const percentageNum = Number(percentageStr)

  if (!Number.isInteger(percentageNum) || percentageNum < 0) {
    throw new UserError(
      `'limit' must be a positive integer: ${originalPercentage}`,
    )
  }

  return percentageNum
}

const PERCENTAGE_REGEXP = /%$/u
