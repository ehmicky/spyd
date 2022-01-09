import { getNoDimensions } from '../combination/filter.js'

import { getContents } from './contents.js'
import { finalizeContents } from './finalize.js'
import { normalizeComputedResult } from './normalize/computed.js'
import { normalizeEarlyResult } from './normalize/early.js'
import { normalizeReportedResults } from './normalize/raw.js'
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
export const reportResult = async function (rawResult, history, config) {
  const startProps = await reportStart(rawResult, history, config)

  try {
    const { programmaticResult, contents } = await reportCompute(startProps)
    await reportPrint(contents)
    return programmaticResult
  } finally {
    await reportEnd(startProps.config)
  }
}

// Start reporting
export const reportStart = async function (rawResult, history, config) {
  const configA = await startReporters(config)
  const { result, history: historyA } = normalizeReportedResults(
    rawResult,
    history,
    configA.select,
  )
  const noDimensions = getNoDimensions(result.combinations)
  const {
    result: resultA,
    sinceResult,
    config: configB,
  } = normalizeEarlyResult({
    result,
    history: historyA,
    noDimensions,
    config: configA,
  })
  return { result: resultA, sinceResult, noDimensions, config: configB }
}

// Report preview results in `run` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (startProps) {
  const contents = await computeContents(startProps)
  const contentsA = finalizeContents(contents)
  return contentsA.length === 0 ? '' : contentsA[0].content
}

// Compute the report contents.
// Unlike `reportPreview`, the first reporter is the programmatic one.
export const reportCompute = async function (startProps) {
  const [{ result: programmaticResult }, ...contents] = await computeContents(
    startProps,
  )
  const contentsA = finalizeContents(contents)
  return { programmaticResult, contents: contentsA }
}

const computeContents = async function (startProps) {
  const config = normalizeComputedResult(startProps)
  const contents = await getContents(config)
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
