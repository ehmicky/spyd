import { addPrintedInfo } from '../print/main.js'

import { handleReportOpt } from './options.js'
import { handleColors } from './colors.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmarks,
  benchmark,
  {
    report: reporters,
    output,
    insert,
    colors,
    system,
    link,
    show,
    diff,
    verbose,
  },
) {
  const benchmarkA = addPrintedInfo(benchmark, { diff, verbose, benchmarks })

  await Promise.all(
    reporters.map(({ report: reportFunc, opts: reportOpt }) =>
      useReporter({
        reportFunc,
        reportOpt,
        benchmark: benchmarkA,
        output,
        insert,
        colors,
        system,
        link,
        show,
      }),
    ),
  )
}

// Perform each reporter
const useReporter = async function({
  reportFunc,
  reportOpt,
  benchmark,
  output,
  insert,
  colors,
  system,
  link,
  show,
}) {
  const { system: systemOpt, ...reportOptB } = handleReportOpt({
    reportOpt,
    output,
    insert,
    colors,
    system,
    link,
    show,
  })

  const benchmarkA = handleSystem(benchmark, systemOpt)

  const content = await reportFunc(benchmarkA, reportOptB)

  const contentA = handleColors(content, reportOptB)

  await handleContent(contentA, reportOptB)
}

// If `system` option is `false`, do not pass it to reporters
const handleSystem = function(
  { system, systemPretty, ...benchmark },
  systemOpt,
) {
  if (systemOpt) {
    return { ...benchmark, system, systemPretty }
  }

  return benchmark
}
