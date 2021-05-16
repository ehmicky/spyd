import { normalizeReportedResult } from '../normalize/result.js'
import { applySince } from '../normalize/since.js'

import { getContents } from './call.js'
import { outputContents, computeTtyContents } from './output.js'
import { startReporters, endReporters } from './start_end.js'

// Report final results in `bench`, `show` and `remove` commands.
export const reportResult = async function (result, previous, config) {
  const resultA = await applySince(result, previous, config)
  const configA = await startReporters(config)

  try {
    const resultB = normalizeReportedResult(resultA)
    const contents = await getContents(resultB, config)
    await outputContents(contents)
    return resultB
  } finally {
    await endReporters(configA)
  }
}

// Report preview results in `bench` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreviewStart = async function (result, previous, config) {
  const [resultA, configA] = await Promise.all([
    applySince(result, previous, config),
    startReporters(config),
  ])
  return { result: resultA, config: configA }
}

export const reportPreview = async function (result, config) {
  const resultA = normalizeReportedResult(result)
  const contents = await getContents(resultA, config)
  const report = computeTtyContents(contents)
  return report
}

export const reportPreviewEnd = async function (config) {
  await endReporters(config)
}
