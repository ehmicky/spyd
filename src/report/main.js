import { normalizeReportedResult } from '../normalize/result.js'
import { applySince, mergeHistoryResult } from '../normalize/since.js'
import { addFooters } from '../system/handle.js'

import { getContents } from './contents/main.js'
import { outputContents } from './output.js'
import { startReporters, endReporters } from './start_end.js'

// Report final results in `show` and `remove` commands.
// The `run` command needs to perform those steps separately due to previews:
//  - This allows previews to re-use the same reporting logic
//  - This ensures slow logic like `applySince()` and `reporter.start|end` is
//    only applied once
//  - This prevents a clear screen flash at the end, by ensuring slow logic like
//    the final `reportCompute()` is not performed after the preview ended
//    after clearing the screen
export const reportResult = async function (result, previous, config) {
  const { historyResult, config: configA } = await reportStart(
    result,
    previous,
    config,
  )

  try {
    const { programmaticResult, contents } = await reportCompute(
      result,
      historyResult,
      configA,
    )
    await reportPrint(contents)
    return programmaticResult
  } finally {
    await reportEnd(configA)
  }
}

// Start reporting
export const reportStart = async function (result, previous, config) {
  const [historyResult, configA] = await Promise.all([
    applySince(result, previous, config),
    startReporters(config),
  ])
  const configB = addFooters({ result, historyResult, config: configA })
  return { historyResult, config: configB }
}

// Report preview results in `run` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, historyResult, config) {
  const {
    contents: [{ contentsString = '' } = {}],
  } = await reportCompute(result, historyResult, config)
  return contentsString
}

// Compute the report contents
export const reportCompute = async function (result, historyResult, config) {
  const resultA = mergeHistoryResult(result, historyResult)
  const resultB = normalizeReportedResult(resultA)
  const { programmaticResult, contents } = await getContents(resultB, config)
  return { programmaticResult, contents }
}

// Print the report contents to the output
export const reportPrint = async function (contents) {
  await outputContents(contents)
}

// End reporting
export const reportEnd = async function (config) {
  await endReporters(config)
}
