import { addPrintedInfo } from '../print/main.js'
import { addPrevious } from '../print/previous.js'

import { handleReportOpt } from './options.js'
import { handleColors } from './colors.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  job,
  benchmarks,
  {
    report: reporters,
    output,
    insert,
    limits,
    colors,
    system,
    link,
    show,
    diff,
    verbose,
  },
) {
  const benchmark = getBenchmark(job, benchmarks, { limits, diff, verbose })

  await Promise.all(
    reporters.map(({ report: reportFunc, opts: reportOpt }) =>
      useReporter({
        reportFunc,
        reportOpt,
        benchmark,
        output,
        insert,
        colors,
        system,
        link,
        show,
      }),
    ),
  )

  return benchmark
}

const getBenchmark = function(job, benchmarks, { limits, diff, verbose }) {
  const benchmarksA = benchmarks.map(benchmark =>
    addPrintedInfo(benchmark, { verbose }),
  )

  const benchmarkA = benchmarksA.find(benchmark => benchmark.job === job)
  const benchmarkB = addPrevious(benchmarksA, benchmarkA, {
    limits,
    diff,
    verbose,
  })
  return benchmarkB
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
