import { normalizeReportedResult } from '../normalize/result.js'
import { applySince } from '../normalize/since.js'

import { getContents } from './call.js'
import { outputContents, computeTtyContents } from './output.js'
import { startReporters, endReporters } from './start_end.js'

// Report final results in `bench`, `show` and `remove` commands.
export const reportResult = async function (result, previous, config) {
  const { result: resultA, config: configA } = await reportStart(
    result,
    previous,
    config,
  )

  try {
    return await reportNonPreview(resultA, configA)
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

const reportNonPreview = async function (result, config) {
  const resultA = normalizeReportedResult(result)
  const contents = await getContents(resultA, config)
  await outputContents(contents)
  return resultA
}

// Report preview results in `bench` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, config) {
  const resultA = normalizeReportedResult(result)
  const contents = await getContents(resultA, config)
  const report = computeTtyContents(contents)
  return report
}

export const reportEnd = async function (config) {
  await endReporters(config)
}
