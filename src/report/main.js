import { getNoDimensions } from '../combination/filter.js'
import { applySince } from '../history/since/main.js'

import { getContents } from './contents.js'
import { finalizeContents } from './finalize.js'
import { normalizeComputedResult } from './normalize/computed.js'
import { normalizeEarlyResult } from './normalize/early.js'
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
export const reportResult = async function (rawResult, previous, config) {
  const {
    result,
    historyInfo,
    config: configA,
  } = await reportStart(rawResult, previous, config)

  try {
    const { programmaticResult, contents } = await reportCompute(
      result,
      historyInfo,
      configA,
    )
    await reportPrint(contents)
    return programmaticResult
  } finally {
    await reportEnd(configA)
  }
}

// Start reporting
export const reportStart = async function (rawResult, previous, config) {
  const [history, configA] = await Promise.all([
    applySince(rawResult, previous, config),
    startReporters(config),
  ])
  const noDimensions = getNoDimensions(rawResult.combinations)
  const historyInfo = { history, noDimensions }
  const { result, config: configB } = normalizeEarlyResult(
    rawResult,
    historyInfo,
    configA,
  )
  return { result, historyInfo, config: configB }
}

// Report preview results in `run` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, historyInfo, config) {
  const contents = await computeContents(result, historyInfo, config)
  const contentsA = finalizeContents(contents)
  return contentsA.length === 0 ? '' : contentsA[0].content
}

// Compute the report contents.
// Unlike `reportPreview`, the first reporter is the programmatic one.
export const reportCompute = async function (result, historyInfo, config) {
  const [{ result: programmaticResult }, ...contents] = await computeContents(
    result,
    historyInfo,
    config,
  )
  const contentsA = finalizeContents(contents)
  return { programmaticResult, contents: contentsA }
}

const computeContents = async function (result, historyInfo, config) {
  const configA = normalizeComputedResult(result, historyInfo, config)
  const contents = await getContents(configA)
  return contents
}

// Print the report contents to the output
export const reportPrint = async function (contents) {
  await outputContents(contents)
}

// End reporting
export const reportEnd = async function (config) {
  await endReporters(config)
}
