import { groupDimensionInfos } from '../combination/group.js'
import { sortCombinations } from '../combination/sort.js'
import { addCombinationsDiff } from '../compare/diff.js'
import { addFooter } from '../system/footer.js'

import { omitCombinationsProps } from './omit.js'
import { mergeHistory } from './since.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from './tty.js'

// Add report-specific properties to each `history` result.
// This is only computed once at the beginning of the command.
export const normalizeHistory = function (history, config) {
  const historyA = history
    .map(normalizeHistoryResult)
    .map(normalizeNonCombAll)
    .map(normalizeCombAll)
  const reporters = config.reporters.map((reporter) =>
    normalizeHistoryEach(historyA, reporter),
  )
  return { ...config, reporters }
}

// Add report-specific properties that only apply to `history` results
// History should only be accessed at the target result level. We set an empty
// array of history results for monomorphism.
const normalizeHistoryResult = function (result) {
  return { ...result, history: [] }
}

// Add report-specific properties to each `history` result that are
// reporter-specific.
// Those are saved in `reporter.history` and merged later.
const normalizeHistoryEach = function (history, reporter) {
  const historyA = history
    .map((result) => ({ ...result, ...normalizeNonCombEach(result, reporter) }))
    .map((result) => normalizeCombEach(result, reporter))
  return { ...reporter, history: historyA }
}

// Add report-specific properties to the target result, except for
// `combinations` since this is applied before measuring and history merging
// have been performed.
// This is only computed once at the beginning of the command.
export const normalizeTargetResult = function (result, historyResult, config) {
  const resultA = addSizeInfo(result)
  const resultB = normalizeNonCombAll(resultA)
  const reporters = config.reporters.map((reporter) =>
    normalizeTargetResEach({
      result: resultB,
      historyResult,
      reporter,
      config,
    }),
  )
  return { result: resultB, config: { ...config, reporters } }
}

// Add report-specific properties to the target result that are not
// `combinations` related but are reporter-specific.
// This is saved to `reporter.resultProps` and merged later.
// Footers are only applied to the target result, not the history results, since
// they are not very useful for those.
const normalizeTargetResEach = function ({
  result,
  historyResult,
  reporter,
  config,
}) {
  const resultProps = normalizeNonCombEach(result, reporter)
  const reporterA = addFooter({ result, historyResult, reporter, config })
  return { ...reporterA, resultProps }
}

// Add report-specific properties to the target result, but only for
// `combinations`. This is applied after measuring and history merging have
// been performed.
// This is computed repeatedly by each preview. We minimize the cost of it by
// performing anything which can be initially computing only once at the
// beginning of the command in `normalizeHistory()` and
// `normalizeTargetResult()`
export const normalizeComputedResult = function (
  unmergedResult,
  historyResult,
  config,
) {
  const resultA = mergeHistory(unmergedResult, historyResult)
  const unmergedResultA = normalizeCombAll(unmergedResult)
  const resultB = normalizeCombAll(resultA)
  const reporters = config.reporters.map((reporter) =>
    normalizeComputedResEach(resultB, unmergedResultA, reporter),
  )
  return { ...config, reporters }
}

// Add report-specific properties to the target result that are `combinations`
// related and reporter-specific.
const normalizeComputedResEach = function (
  result,
  unmergedResult,
  { history, resultProps, footerParams, ...reporter },
) {
  const resultA = addCombinationsDiff(result, history, reporter)
  const resultB = normalizeCombEach(resultA, reporter)
  const unmergedResultA = normalizeCombEach(unmergedResult, reporter)
  const resultC = { ...resultB, history: [...history, unmergedResultA] }
  const resultD = { ...resultC, ...resultProps, ...footerParams }
  return { ...reporter, result: resultD }
}

// Add report-specific properties to a result that are not in `combinations` nor
// reporter-specific
const normalizeNonCombAll = function (result) {
  return result
}

// Add screen size-related information.
// Not added to history results since this does not reflect the screen size when
// the history result was taken
const addSizeInfo = function (result) {
  const screenWidth = getPaddedScreenWidth()
  const screenHeight = getPaddedScreenHeight()
  return { ...result, screenWidth, screenHeight }
}

// Add report-specific properties to a result that are in `combinations` but not
// reporter-specific.
// We exclude `diff[Precise]` since it relies on `history`, which makes it hard
// to handle. Also, we do not need it inside history result
const normalizeCombAll = function (result) {
  const resultB = groupResultCombinations(result)
  return resultB
}

// Add `result.*` properties based on grouping combinations by dimension.
const groupResultCombinations = function ({ combinations, ...result }) {
  const { combinations: combinationsA, dimensions } =
    groupDimensionInfos(combinations)
  const combinationsB = sortCombinations(combinationsA)
  return { ...result, combinations: combinationsB, dimensions }
}

// Add report-specific properties to a result that are not in `combinations` but
// are reporter-specific
const normalizeNonCombEach = function (result, reporter) {
  return {}
}

// Add report-specific properties to a result that are in `combinations` and
// reporter-specific
const normalizeCombEach = function (
  result,
  { debugStats, config: { showPrecision, showDiff } },
) {
  const resultA = omitCombinationsProps(result, {
    showPrecision,
    showDiff,
    debugStats,
  })
  return resultA
}
