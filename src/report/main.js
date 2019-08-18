import { normalizeEnvs } from '../print/env.js'
import { addPrintedInfo } from '../print/main.js'
import { mergeJobBenchmarks } from '../jobs/merge.js'

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
  const { benchmark: benchmarkA, benchmarks: benchmarksA } = normalizeEnvs(
    benchmark,
    benchmarks,
  )
  const benchmarkB = mergeJobBenchmarks(benchmarksA, benchmarkA)
  const benchmarkC = addPrintedInfo(benchmarkB, {
    diff,
    verbose,
    benchmarks: benchmarksA,
  })

  await Promise.all(
    reporters.map(({ report: reportFunc, opts: reportOpt }) =>
      useReporter({
        reportFunc,
        reportOpt,
        benchmark: benchmarkC,
        output,
        insert,
        colors,
        system,
        link,
        show,
      }),
    ),
  )

  return benchmarkC
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
