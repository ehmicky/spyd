import { omitNoDimensions } from '../../combination/filter.js'
import { sortCombinations } from '../../combination/sort.js'
import { sortDimensions } from '../../combination/sort_dimensions.js'
import { addCombinationsDiff } from '../../history/compare/diff.js'
import { omitSystemProps } from '../../system/omit.js'
import { normalizeTimestamp } from '../../system/timestamp.js'

import { omitCombinationsProps } from './omit.js'
import { addCombinationsTitles } from './titles_add.js'

// Add report-specific properties to a result that are not in `combinations` nor
// reporter-specific
export const normalizeNonCombAll = function (result) {
  return result
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific
export const normalizeCombAll = function (result, sinceResult, noDimensions) {
  const resultA = normalizeCombAllUnmerged(result, sinceResult)
  const resultB = normalizeCombAllMerged(resultA, noDimensions)
  return resultB
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific and must be applied before the history is merged.
// In principle:
//  - We should have different logic for `sinceResult` and other history results
//    because `sinceResult` is used for the diff logic.
//     - For example the diff logic requires `mean` to be available
//  - However, keeping track of an earlier version of it as
//    `historyResult.sinceResult` is a shortcut that is enough for the moment.
export const normalizeCombAllUnmerged = function (result, sinceResult) {
  const resultA = addCombinationsDiff(result, sinceResult)
  return resultA
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific and must be applied after the history is merged.
export const normalizeCombAllMerged = function (result, noDimensions) {
  const resultA = omitNoDimensions(result, noDimensions)
  const resultB = sortDimensions(resultA)
  const resultC = sortCombinations(resultB)
  const resultD = omitSystemProps(resultC)
  return resultD
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
export const normalizeCombEach = function (
  result,
  {
    capabilities: { debugStats },
    config: { showPrecision, showDiff, showTitles },
  },
  { titles },
) {
  const resultA = addCombinationsTitles(result, titles, showTitles)
  const resultB = omitCombinationsProps(resultA, {
    showPrecision,
    showDiff,
    debugStats,
  })
  return resultB
}
