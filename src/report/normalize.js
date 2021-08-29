import { groupDimensionInfos } from '../combination/group.js'
import { sortCombinations } from '../combination/sort.js'
import { addCombinationsDiff } from '../compare/diff.js'
import { mergeHistory } from '../history/since/main.js'
import { addFooter } from '../system/footer.js'

import { omitCombinationsProps } from './omit.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from './tty.js'

// Normalize as many properties as possible at the beginning of the reporting
// (once) as opposed to later on (repeatedly)
export const normalizeEarlyResult = function (result, historyInfo, config) {
  const configA = normalizeHistory(historyInfo, config)
  const { result: resultA, config: configB } = normalizeTargetResult(
    result,
    historyInfo,
    configA,
  )
  return { result: resultA, config: configB }
}

// Add report-specific properties to each `history` result.
// This is only computed once at the beginning of the command.
const normalizeHistory = function (
  { history, history: [sinceResult] },
  config,
) {
  const historyA = history
    .map((result) => normalizeCombAllUnmerged(result, sinceResult))
    .map(normalizeHistoryAll)
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
const normalizeHistoryAll = function (result) {
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
const normalizeTargetResult = function (result, { mergedResult }, config) {
  const resultA = addSizeInfo(result)
  const resultB = normalizeNonCombAll(resultA)
  const reporters = config.reporters.map((reporter) =>
    normalizeTargetEach({ result: resultB, mergedResult, reporter, config }),
  )
  return { result: resultB, config: { ...config, reporters } }
}

// Add report-specific properties to the target result that are not
// `combinations` related but are reporter-specific.
// This is saved to `reporter.resultProps` and merged later.
// Footers are only applied to the target result, not the history results, since
// they are not very useful for those.
const normalizeTargetEach = function ({
  result,
  mergedResult,
  reporter,
  config,
}) {
  const resultProps = normalizeNonCombEach(result, reporter)
  const reporterA = addFooter({ result, mergedResult, reporter, config })
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
  { mergedResult, history: [sinceResult] },
  config,
) {
  const unmergedResultA = normalizeCombAllUnmerged(unmergedResult, sinceResult)
  const result = mergeHistory(unmergedResultA, mergedResult)
  const unmergedResultB = normalizeCombAll(unmergedResultA)
  const resultA = normalizeCombAll(result)
  const reporters = config.reporters.map((reporter) =>
    normalizeComputedEach(resultA, unmergedResultB, reporter),
  )
  return { ...config, reporters }
}

// Add report-specific properties to the target result that are `combinations`
// related and reporter-specific.
const normalizeComputedEach = function (
  result,
  unmergedResult,
  { history, resultProps, footerParams, ...reporter },
) {
  const resultA = normalizeCombEach(result, reporter)
  const unmergedResultA = normalizeCombEach(unmergedResult, reporter)
  const resultB = { ...resultA, history: [...history, unmergedResultA] }
  const resultC = { ...resultB, ...resultProps, ...footerParams }
  return { ...reporter, result: resultC }
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

// Add report-specific properties to a result that are in `combinations` and
// but are not reporter-specific and must be applied for history is merged
const normalizeCombAllUnmerged = function (result, sinceResult) {
  const resultA = addCombinationsDiff(result, sinceResult)
  return resultA
}

// Add report-specific properties to a result that are in `combinations` but not
// reporter-specific.
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
