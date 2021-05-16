import { normalizeReportedResult } from '../normalize/result.js'

import { getContents } from './call.js'
import { outputContents, computeTtyContents } from './output.js'
import { startReporters, endReporters } from './start_end.js'

// Report final results in `bench`, `show` and `remove` commands.
export const reportResult = async function (result, config) {
  const configA = await startReporters(config)

  try {
    const resultA = normalizeReportedResult(result)
    const contents = await getContents(resultA, config)
    await outputContents(contents)
    return resultA
  } finally {
    await endReporters(configA)
  }
}

// Report preview results in `bench` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreviewStart = async function (config) {
  return await startReporters(config)
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
