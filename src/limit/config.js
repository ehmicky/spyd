import { UserError } from '../error/main.js'

// Normalize 'limit' configuration property
export const normalizeLimits = function (limits) {
  return limits.map(normalizeLimit)
}

const normalizeLimit = function (limit) {
  const [rawPercentage, ...ids] = limit.trim().split(SEPARATOR)
  const percentage = getPercentage(rawPercentage)
  return { ids, percentage }
}

const SEPARATOR = /\s+/gu

const getPercentage = function (rawPercentage) {
  const percentageStr = rawPercentage.replace(PERCENTAGE_REGEXP, '')

  if (rawPercentage === percentageStr) {
    throw new UserError(`'limit' percentage must end with %: ${rawPercentage}`)
  }

  const percentageNum = Number(percentageStr)

  if (!Number.isInteger(percentageNum) || percentageNum < 0) {
    throw new UserError(
      `'limit' percentage must be a positive integer: ${rawPercentage}`,
    )
  }

  return percentageNum
}

const PERCENTAGE_REGEXP = /%$/u
