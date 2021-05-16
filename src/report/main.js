import { getContents } from './call.js'
import {
  outputContents,
  outputTtyContents,
  computeTtyContents,
} from './output.js'
import { startReporters, endReporters } from './start_end.js'

// Report final results in `bench` and `show` commands.
export const reportBenchShow = async function (result, config) {
  const configA = await startReporters(config)

  try {
    const { result: resultA, contents } = await getContents(result, config)
    await outputContents(contents)
    return resultA
  } finally {
    await endReporters(configA)
  }
}

// Report final results in `remove` command.
// Reporting is shown so the user can be clear about which result was removed,
// and provide with confirmation. So we only need to print in the terminal,
// not output|insert files.
export const reportRemove = async function (result, config) {
  const configA = await startReporters(config)

  try {
    const { result: resultA, contents } = await getContents(result, config)
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
  const { contents } = await getContents(result, config)
  const report = computeTtyContents(contents)
  return report
}

export const reportPreviewEnd = async function (config) {
  await endReporters(config)
}
