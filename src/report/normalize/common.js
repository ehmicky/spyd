import { groupResultCombinations } from '../../combination/group.js'
import { addCombinationsDiff } from '../../history/compare/diff.js'
import { omitSystemProps } from '../../system/omit.js'
import { normalizeTimestamp } from '../../system/timestamp.js'

import { omitCombinationsProps } from './omit.js'
import { addCombinationsTitles, addDimensionsTitles } from './titles.js'

// Add report-specific properties to a result that are not in `combinations` nor
// reporter-specific
export const normalizeNonCombAll = function (result) {
  return result
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific
export const normalizeCombAll = function (result, sinceResult) {
  const resultA = normalizeCombAllUnmerged(result, sinceResult)
  const resultB = normalizeCombAllMerged(resultA)
  return resultB
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific and must be applied before the history is merged.
// In principle:
//  - We should have different logic for `sinceResult` and other history results
//    because `sinceResult` is used for the diff logic.
//     - For example the diff logic requires `median` to be available
//  - However, keeping track of an earlier version of it as
//    `historyResult.sinceResult` is a shortcut that is enough for the moment.
export const normalizeCombAllUnmerged = function (result, sinceResult) {
  const resultA = addCombinationsDiff(result, sinceResult)
  return resultA
}

// Add report-specific properties to a result that are in `combinations`, are
// not reporter-specific and must be applied after the history is merged.
export const normalizeCombAllMerged = function (result) {
  const resultA = groupResultCombinations(result)
  const resultB = omitSystemProps(resultA)
  return resultB
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
  { debugStats, config: { showPrecision, showDiff, showTitles } },
  { titles },
) {
  const resultA = addDimensionsTitles(result, titles, showTitles)
  const resultB = addCombinationsTitles(resultA, titles, showTitles)
  const resultC = omitCombinationsProps(resultB, {
    showPrecision,
    showDiff,
    debugStats,
  })
  return resultC
}