import {
  normalizeNonCombAll,
  normalizeCombAllUnmerged,
  normalizeCombAll,
  normalizeNonCombEach,
  mergeResultProps,
  normalizeCombEach,
} from './common.js'
import { normalizeTargetResult } from './target.js'

// Normalize as many properties as possible at the beginning of the reporting
// (once) as opposed to later on (repeatedly)
export const normalizeEarlyResult = function (
  result,
  { history, history: [sinceResult], mergedResult },
  config,
) {
  const configA = normalizeHistory(history, sinceResult, config)
  const { result: resultA, config: configB } = normalizeTargetResult(
    result,
    mergedResult,
    configA,
  )
  return { result: resultA, config: configB }
}

// Add report-specific properties to each `history` result.
// This is only computed once at the beginning of the command.
const normalizeHistory = function (history, sinceResult, config) {
  const historyA = history
    .map((result) => normalizeCombAllUnmerged(result, sinceResult))
    .map(normalizeHistoryAll)
    .map(normalizeNonCombAll)
    .map(normalizeCombAll)
  const reporters = config.reporters.map((reporter) =>
    normalizeHistoryEach(historyA, reporter, config),
  )
  return { ...config, reporters }
}

// Add report-specific properties that only apply to `history` results.
// History should only be accessed at the target result level.
// We set an empty array of history results for monomorphism.
const normalizeHistoryAll = function (result) {
  return { ...result, history: [] }
}

// Add report-specific properties to each `history` result that are
// reporter-specific.
// Those are saved in `reporter.history` and merged later.
const normalizeHistoryEach = function (history, reporter, config) {
  const historyA = history
    .map((result) =>
      mergeResultProps(result, normalizeNonCombEach(result, reporter)),
    )
    .map((result) => normalizeCombEach(result, reporter, config))
  return { ...reporter, history: historyA }
}
