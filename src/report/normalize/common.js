import { omitNoDimensions } from '../../combination/filter.js'
import { sortCombinations } from '../../combination/sort_combinations.js'
import { sortDimensions } from '../../combination/sort_dimensions.js'
import { useResultConfigSelectors } from '../../config/select/use.js'
import { addCombinationsDiff } from '../../history/compare/diff.js'
import { pickCombProps, pickTopProps } from '../../top/omit.js'
import { normalizeTimestamp } from '../../top/timestamp.js'

import { omitCombinationsProps } from './omit.js'
import { addCombinationsTitles } from './titles_add.js'

// Add report-specific properties to a result that are not in `combinations` nor
// reporter-specific
export const normalizeNonCombAll = function (result) {
  return pickTopProps(result)
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific
export const normalizeCombAll = async function (
  result,
  { sinceResult, noDimensions, config },
) {
  const resultA = await useResultConfigSelectors(result, config)
  const resultB = addCombinationsDiff(resultA, sinceResult)
  const resultC = omitNoDimensions(resultB, noDimensions)
  const resultD = sortDimensions(resultC)
  const resultE = sortCombinations(resultD)
  return resultE
}

// Add report-specific properties to a result that are not in `combinations` but
// are reporter-specific
export const normalizeNonCombEach = function (result, { tty }) {
  const timestamp = normalizeTimestamp(result, tty)
  return { timestamp }
}

export const mergeResultProps = function (result, resultProps) {
  return { ...result, ...resultProps }
}

// Add report-specific properties to a result that are in `combinations` and
// reporter-specific
export const normalizeCombEach = async function (
  result,
  { capabilities: { debugStats }, config: reporterConfig },
  { titles },
) {
  const resultA = await useResultConfigSelectors(result, reporterConfig)
  const resultB = addCombinationsTitles(resultA, titles)
  const resultC = omitCombinationsProps(resultB, debugStats)
  const resultD = pickCombProps(resultC)
  return resultD
}
