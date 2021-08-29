import { mergeHistory } from '../../history/since/main.js'
import { addScreenInfo } from '../tty.js'

import {
  normalizeCombAllUnmerged,
  normalizeCombAllMerged,
  mergeResultProps,
  normalizeCombEach,
} from './common.js'
import { prettifyStats, prettifyHistoryStats } from './stats/main.js'

// Add report-specific properties to the target result, but only for
// `combinations`. This is applied after measuring and history merging have
// been performed.
// This is computed repeatedly by each preview. We minimize the cost of it by
// performing anything which can be initially computing only once at the
// beginning of the command in `normalizeHistory()` and
// `normalizeTargetResult()`
export const normalizeComputedResult = function (
  unmergedResult,
  { history: [sinceResult], mergedResult },
  config,
) {
  const unmergedResultA = normalizeCombAllUnmerged(unmergedResult, sinceResult)
  const result = mergeHistory(unmergedResultA, mergedResult)
  const resultA = normalizeCombAllMerged(result)
  const resultB = prettifyStats(resultA, resultA.combinations)
  const resultC = addScreenInfo(resultB)
  const reporters = config.reporters.map((reporter) =>
    normalizeComputedEach({
      result: resultC,
      unmergedResult: unmergedResultA,
      reporter,
      config,
    }),
  )
  return { ...config, reporters }
}

// Add report-specific properties to the target result that are `combinations`
// related and reporter-specific.
const normalizeComputedEach = function ({
  result,
  unmergedResult,
  reporter: { history, resultProps, footerParams, ...reporter },
  config,
}) {
  const resultA = addLastResult({
    result,
    unmergedResult,
    history,
    reporter,
    config,
  })
  const resultB = normalizeCombEach(resultA, reporter, config)
  const resultC = mergeResultProps(resultB, resultProps)
  const resultD = { ...resultC, ...footerParams }
  return { ...reporter, result: resultD }
}

// The last history result is identical to the target result except:
//  - It must use history result's normalization, not target result
//  - Its combinations do not include `mergeResult`
// We also apply `capabilities.history: false`, which omits `result.history`.
const addLastResult = function ({
  result,
  unmergedResult: { combinations },
  history,
  reporter,
  reporter: { capabilities },
  config,
}) {
  if (!capabilities.history) {
    return result
  }

  const lastResult = history[history.length - 1]
  const historyA = history.slice(0, -1)
  const lastResultA = { ...lastResult, combinations }
  const lastResultB = normalizeCombAllMerged(lastResultA)
  const lastResultC = normalizeCombEach(lastResultB, reporter, config)
  const historyB = [...historyA, lastResultC]
  const historyC = prettifyHistoryStats(historyB)
  return { ...result, history: historyC }
}
