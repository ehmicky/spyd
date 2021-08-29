import { addFooter } from '../../system/footer.js'
import { omitMetadataProps } from '../../system/omit.js'
import { addScreenInfo } from '../tty.js'

import {
  normalizeNonCombAll,
  normalizeCombAllUnmerged,
  normalizeCombAll,
  normalizeNonCombEach,
  mergeResultProps,
  normalizeCombEach,
} from './common.js'

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
    normalizeHistoryEach(historyA, reporter, config),
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
const normalizeHistoryEach = function (history, reporter, config) {
  const historyA = history
    .map((result) =>
      mergeResultProps(result, normalizeNonCombEach(result, reporter)),
    )
    .map((result) => normalizeCombEach(result, reporter, config))
  return { ...reporter, history: historyA }
}

// Add report-specific properties to the target result, except for
// `combinations` since this is applied before measuring and history merging
// have been performed.
// This is only computed once at the beginning of the command.
const normalizeTargetResult = function (result, { mergedResult }, config) {
  const resultA = normalizeNonCombAll(result)
  const reporters = config.reporters.map((reporter) =>
    normalizeTargetEach({ result: resultA, mergedResult, reporter, config }),
  )
  const resultB = omitMetadataProps(resultA)
  const resultC = addScreenInfo(resultB)
  return { result: resultC, config: { ...config, reporters } }
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
