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
  const reportOptB = handleReportOpt({
    reportOpt,
    output,
    insert,
    colors,
    system,
    link,
    show,
  })

  const content = await reportFunc(benchmark, reportOptB)

  const contentA = handleColors(content, reportOptB)

  await handleContent(contentA, reportOptB)
}
