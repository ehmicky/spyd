import { getContents } from './call.js'
import {
  outputContents,
  outputTtyContents,
  computeTtyContents,
} from './output.js'
import { endReporters } from './start_end.js'

// Report final results in `bench` and `show` commands.
export const reportBenchShow = async function (result, { reporters, titles }) {
  const { result: resultA, contents } = await getContents(result, {
    reporters,
    titles,
  })
  await endReporters(reporters)
  await outputContents(contents)
  return resultA
}

// Report final results in `remove` command.
// Reporting is shown so the user can be clear about which result was removed,
// and provide with confirmation. So we only need to print in the terminal,
// not output|insert files.
export const reportRemove = async function (result, { reporters, titles }) {
  const { result: resultA, contents } = await getContents(result, {
    reporters,
    titles,
  })
  await endReporters(reporters)
  await outputTtyContents(contents)
  return resultA
}

// Report preview results in `bench` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, { reporters, titles }) {
  const { contents } = await getContents(result, { reporters, titles })
  const previewReport = computeTtyContents(contents)
  return previewReport
}
