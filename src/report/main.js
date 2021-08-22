import { getContents, finalizeContents } from './contents/main.js'
import {
  normalizeHistory,
  normalizeTargetResult,
  normalizeComputedResult,
} from './normalize.js'
import { outputContents } from './output.js'
import { applySince } from './since.js'
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
  const {
    result: resultA,
    historyResult,
    config: configA,
  } = await reportStart(result, previous, config)

  try {
    const { programmaticResult, contents } = await reportCompute(
      resultA,
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
  const [{ historyResult, history }, configA] = await Promise.all([
    applySince(result, previous, config),
    startReporters(config),
  ])
  const configB = normalizeHistory(history, configA)
  const { result: resultA, config: configC } = normalizeTargetResult(
    result,
    historyResult,
    configB,
  )
  return { result: resultA, historyResult, config: configC }
}

// Report preview results in `run` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, historyResult, config) {
  const contents = await computeContents(result, historyResult, config)
  const contentsA = finalizeContents(contents)
  return contentsA.length === 0 ? '' : contentsA[0].contentsString
}

// Compute the report contents.
// Unlike `reportPreview`, the first reporter is the programmatic one.
export const reportCompute = async function (result, historyResult, config) {
  const [{ result: programmaticResult }, ...contents] = await computeContents(
    result,
    historyResult,
    config,
  )
  const contentsA = finalizeContents(contents)
  return { programmaticResult, contents: contentsA }
}

const computeContents = async function (result, historyResult, config) {
  const configA = normalizeComputedResult(result, historyResult, config)
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
