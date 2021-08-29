import { mergeHistory, mergeLastResult } from '../../history/since/main.js'
import { addScreenInfo } from '../tty.js'

import {
  normalizeCombAll,
  normalizeCombAllUnmerged,
  normalizeCombAllMerged,
  mergeResultProps,
  normalizeCombEach,
} from './common.js'

// Add report-specific properties to the target result, but only for
// `combinations`. This is applied after measuring and history merging have
// been performed.
// This is computed repeatedly by each preview. We minimize the cost of it by
// performing anything which can be initially computing only once at the
// beginning of the command in `normalizeHistory()` and
// `normalizeTargetResult()`
export const normalizeComputedResult = function (
  result,
  { history: [sinceResult], mergedResult },
  config,
) {
  const resultA = normalizeCombAllUnmerged(result, sinceResult)
  const resultB = mergeHistory(resultA, mergedResult)
  const resultC = normalizeCombAllMerged(resultB)
  const resultD = addScreenInfo(resultC)
  const reporters = config.reporters.map((reporter) =>
    normalizeComputedEach({
      result: resultD,
      sinceResult,
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
  sinceResult,
  reporter: {
    capabilities: { history: hasHistory },
  },
  reporter: { history, resultProps, footerParams, ...reporter },
  config,
}) {
  const resultA = normalizeCombEach(result, reporter, config)
  const resultB = addLastResult({
    result: resultA,
    history,
    sinceResult,
    hasHistory,
  })
  const resultC = mergeResultProps(resultB, resultProps)
  const resultD = { ...resultC, ...footerParams }
  return { ...reporter, result: resultD }
}

// The last history result is identical to the target result except:
//  - It must use history result's normalization, not target result
//  - Its combinations do not include `mergeResult`
// We also apply `capabilities.history: false`, which omits `result.history`.
const addLastResult = function ({ result, history, sinceResult, hasHistory }) {
  if (!hasHistory) {
    return result
  }

  const lastResult = history[history.length - 1]
  const historyA = history.slice(0, -1)
  const lastResultA = mergeLastResult(lastResult, result)
  const lastResultB = normalizeCombAll(lastResultA, sinceResult)
  return { ...result, history: [...historyA, lastResultB] }
}
