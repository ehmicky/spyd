import {
  normalizeNonCombAll,
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
  { history, noDimensions },
  config,
) {
  const configA = normalizeHistory(history, noDimensions, config)
  const { result: resultA, config: configB } = normalizeTargetResult(
    result,
    configA,
  )
  return { result: resultA, config: configB }
}

// Add report-specific properties to each `history` result.
// This is only computed once at the beginning of the command.
const normalizeHistory = function (history, noDimensions, config) {
  if (!config.reporters.some(reporterHasHistory)) {
    return config
  }

  const historyA = history.map(normalizeHistoryAll).map(normalizeNonCombAll)
  const historyB = historyA.map((result) =>
    normalizeCombAll(result, historyA, noDimensions),
  )
  const reporters = config.reporters.map((reporter) =>
    normalizeHistoryEach(historyB, reporter, config),
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
  if (!reporterHasHistory(reporter)) {
    return reporter
  }

  const historyA = history
    .map((result) =>
      mergeResultProps(result, normalizeNonCombEach(result, reporter)),
    )
    .map((result) => normalizeCombEach(result, reporter, config))
  return { ...reporter, history: historyA }
}

// As a performance optimization, reporters which do not use `history` do not
// normalize it
const reporterHasHistory = function ({ capabilities: { history } }) {
  return history
}
