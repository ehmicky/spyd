import { omitNoDimensions } from '../../combination/filter.js'
import { sortCombinations } from '../../combination/sort_combinations.js'
import { sortDimensions } from '../../combination/sort_dimensions.js'
import { addCombinationsDiff } from '../../history/compare/diff.js'
import { omitSystemProps, pickTopProps } from '../../top/omit.js'
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
// `history` results should not have performed `normalizeCombAll()` nor
// `normalizeCombEach()` yet
//  - For example, `diff` logic relies on `mean` not to have been omitted
export const normalizeCombAll = function (result, history, noDimensions) {
  const resultA = addCombinationsDiff(result, history)
  const resultB = omitNoDimensions(resultA, noDimensions)
  const resultC = sortDimensions(resultB)
  const resultD = sortCombinations(resultC)
  const resultE = omitSystemProps(resultD)
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
