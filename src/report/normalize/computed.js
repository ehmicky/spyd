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
export const normalizeComputedResult = async ({
  result: initialResult,
  sinceResult,
  noDimensions,
  config,
}) => {
  const result = await normalizeCombAll(initialResult, {
    sinceResult,
    noDimensions,
    config,
  })
  const resultA = prettifyStats(result, result.combinations)
  const resultB = addScreenInfo(resultA)
  const reporters = await Promise.all(
    config.reporters.map((reporter) =>
      normalizeComputedEach({
        result: resultB,
        initialResult,
        sinceResult,
        noDimensions,
        reporter,
        config,
      }),
    ),
  )
  return { ...config, reporters }
}

// Add report-specific properties to the target result that are `combinations`
// related and reporter-specific.
const normalizeComputedEach = async ({
  result,
  initialResult,
  sinceResult,
  noDimensions,
  reporter: { history, resultProps, footerParams, ...reporter },
  config,
}) => {
  const resultA = await addLastResult({
    result,
    initialResult,
    sinceResult,
    noDimensions,
    history,
    reporter,
    config,
  })
  const resultB = await normalizeCombEach(resultA, reporter, config)
  const resultC = mergeResultProps(resultB, resultProps)
  const resultD = { ...resultC, ...footerParams }
  return { ...reporter, result: resultD }
}

// The last history result is identical to the target result except it uses
// history result's normalization, not target result.
// Therefore, we need to merge the combinations of the target result.
const addLastResult = async ({
  result,
  initialResult: { combinations },
  sinceResult,
  noDimensions,
  history,
  reporter,
  reporter: { capabilities },
  config,
}) => {
  if (!capabilities.history) {
    return result
  }

  const lastResult = history.at(-1)
  const lastResultA = { ...lastResult, combinations }
  const lastResultB = await normalizeCombAll(lastResultA, {
    sinceResult,
    noDimensions,
    config,
  })
  const lastResultC = await normalizeCombEach(lastResultB, reporter, config)
  const historyA = setArray(history, history.length - 1, lastResultC)
  const historyB = prettifyHistoryStats(historyA)
  return { ...result, history: historyB }
}
