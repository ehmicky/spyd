import { setArray } from '../../utils/set.js'
import { addScreenInfo } from '../tty.js'

import {
  normalizeCombAll,
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
export const normalizeComputedResult = function ({
  result: initialResult,
  history,
  noDimensions,
  config,
}) {
  const result = normalizeCombAll(initialResult, history, noDimensions)
  const resultA = prettifyStats(result, result.combinations)
  const resultB = addScreenInfo(resultA)
  const reporters = config.reporters.map((reporter) =>
    normalizeComputedEach({
      result: resultB,
      initialResult,
      noDimensions,
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
  initialResult,
  noDimensions,
  reporter: { history, resultProps, footerParams, ...reporter },
  config,
}) {
  const resultA = addLastResult({
    result,
    initialResult,
    noDimensions,
    history,
    reporter,
    config,
  })
  const resultB = normalizeCombEach(resultA, reporter, config)
  const resultC = mergeResultProps(resultB, resultProps)
  const resultD = { ...resultC, ...footerParams }
  return { ...reporter, result: resultD }
}

// The last history result is identical to the target result except it uses
// history result's normalization, not target result.
// Therefore, we need to merge the combinations of the target result.
const addLastResult = function ({
  result,
  initialResult: { combinations },
  noDimensions,
  history,
  reporter,
  reporter: { capabilities },
  config,
}) {
  if (!capabilities.history) {
    return result
  }

  const lastResult = history[history.length - 1]
  const lastResultA = { ...lastResult, combinations }
  const lastResultB = normalizeCombAll(lastResultA, history, noDimensions)
  const lastResultC = normalizeCombEach(lastResultB, reporter, config)
  const historyA = setArray(history, history.length - 1, lastResultC)
  const historyB = prettifyHistoryStats(historyA)
  return { ...result, history: historyB }
}
