// Normalize 'limit' option
export const normalizeLimits = function (limits) {
  return limits.map(normalizeLimit)
}

const normalizeLimit = function (limit) {
  const [ids, percentage] = limit.split(MAIN_SEPARATOR_REGEX)

  if (percentage === undefined) {
    return { percentage: getPercentage(limit) }
  }

  const percentageA = getPercentage(percentage)
  const idsA = ids.split(IDS_SEPARATOR_REGEX).filter(Boolean)
  return { ids: idsA, percentage: percentageA }
}

const MAIN_SEPARATOR_REGEX = /\s*:\s*/u
const IDS_SEPARATOR_REGEX = /\s*,\s*/gu

const getPercentage = function (originalPercentage) {
  const percentageStr = originalPercentage.replace(PERCENTAGE_REGEXP, '')

  if (originalPercentage === percentageStr) {
    throw new TypeError(`'limit' must end with %: ${originalPercentage}`)
  }

  const percentageNum = Number(percentageStr)

  if (!Number.isInteger(percentageNum) || percentageNum < 0) {
    throw new TypeError(
      `'limit' must be a positive integer: ${originalPercentage}`,
    )
  }

  return percentageNum
}

const PERCENTAGE_REGEXP = /%$/u
