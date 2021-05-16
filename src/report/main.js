import { normalizeReportedResult } from '../normalize/result.js'
import { applySince } from '../normalize/since.js'

import { getContents } from './call.js'
import { outputContents, computeTtyContents } from './output.js'
import { startReporters, endReporters } from './start_end.js'

// Report final results in `show` and `remove` commands.
// The `bench` command needs to perform those steps separately due to previews:
//  - This allows previews to re-use the same reporting logic
//  - This ensures slow logic like `applySince()` and `reporter.start|end` is
//    only applied once
//  - This prevents a clear screen flash at the end, by ensuring slow logic like
//    the final `reportCompute()` is not performed after the preview ended
//    after clearing the screen
export const reportResult = async function (result, previous, config) {
  const { result: resultA, config: configA } = await reportStart(
    result,
    previous,
    config,
  )

  try {
    const { finalResult, contents } = await reportCompute(resultA, configA)
    await reportPrint(contents)
    return finalResult
  } finally {
    await reportEnd(configA)
  }
}

export const reportStart = async function (result, previous, config) {
  const [resultA, configA] = await Promise.all([
    applySince(result, previous, config),
    startReporters(config),
  ])
  return { result: resultA, config: configA }
}

// Report preview results in `bench` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, config) {
  const { contents } = await reportCompute(result, config)
  const report = computeTtyContents(contents)
  return report
}

export const reportCompute = async function (result, config) {
  const finalResult = normalizeReportedResult(result)
  const contents = await getContents(finalResult, config)
  return { finalResult, contents }
}

export const reportPrint = async function (contents) {
  await outputContents(contents)
}

export const reportEnd = async function (config) {
  await endReporters(config)
}
