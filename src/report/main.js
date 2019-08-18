import { addPrintedInfo } from '../print/main.js'
import { addPrevious } from '../print/previous.js'
import { checkLimits } from '../limit/error.js'

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
  },
) {
  const benchmark = getBenchmark(job, benchmarks, { limits, diff })

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

  checkLimits(benchmark)

  return benchmark
}

const getBenchmark = function(job, benchmarks, { limits, diff }) {
  const benchmarksA = benchmarks.map(benchmark => addPrintedInfo(benchmark))

  const benchmarkA = benchmarksA.find(benchmark => benchmark.job === job)
  const benchmarkB = addPrevious(benchmarksA, benchmarkA, { limits, diff })
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
