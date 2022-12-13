import {
  normalizeNonCombAll,
  normalizeCombAll,
  normalizeNonCombEach,
  mergeResultProps,
  normalizeCombEach,
} from './common.js'
import { normalizeReportedResults } from './raw.js'
import { normalizeTargetResult } from './target.js'

// Normalize as many properties as possible at the beginning of the reporting
// (once) as opposed to later on (repeatedly)
export const normalizeEarlyResult = async (rawResult, history, config) => {
  const {
    result,
    history: historyA,
    history: [sinceResult],
    noDimensions,
  } = normalizeReportedResults(rawResult, history, config)
  const configA = await normalizeHistory({
    history: historyA,
    result,
    sinceResult,
    noDimensions,
    config,
  })
  const { result: resultA, config: configB } = normalizeTargetResult(
    result,
    configA,
  )
  return { result: resultA, sinceResult, noDimensions, config: configB }
}

// Add report-specific properties to each `history` result.
// This is only computed once at the beginning of the command.
const normalizeHistory = async ({
  history,
  result,
  sinceResult,
  noDimensions,
  config,
}) => {
  if (!config.reporters.some(reporterHasHistory)) {
    return config
  }

  const historyA = [...history, result]
    .map(normalizeHistoryAll)
    .map(normalizeNonCombAll)
  const historyB = await Promise.all(
    historyA.map((historyResult) =>
      normalizeCombAll(historyResult, { sinceResult, noDimensions, config }),
    ),
  )
  const reporters = await Promise.all(
    config.reporters.map((reporter) =>
      normalizeHistoryEach(historyB, reporter, config),
    ),
  )
  return { ...config, reporters }
}

// Add report-specific properties that only apply to `history` results.
// History should only be accessed at the target result level.
// We set an empty array of history results for monomorphism.
const normalizeHistoryAll = (result) => ({ ...result, history: [] })

// Add report-specific properties to each `history` result that are
// reporter-specific.
// Those are saved in `reporter.history` and merged later.
const normalizeHistoryEach = async (history, reporter, config) => {
  if (!reporterHasHistory(reporter)) {
    return reporter
  }

  const historyA = history.map((result) =>
    mergeResultProps(result, normalizeNonCombEach(result, reporter)),
  )
  const historyB = await Promise.all(
    historyA.map((result) => normalizeCombEach(result, reporter, config)),
  )
  return { ...reporter, history: historyB }
}

// As a performance optimization, reporters which do not use `history` do not
// normalize it
const reporterHasHistory = ({ capabilities: { history } }) => history
