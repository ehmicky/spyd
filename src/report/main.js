import { addPrintedInfo } from '../print/main.js'
import { addPrevious } from '../print/previous.js'
import { checkLimits } from '../limit/error.js'

import { handleReportOpt } from './options.js'
import { handleColors } from './colors.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function (
  group,
  benchmarks,
  {
    report: reporters,
    output,
    insert,
    limits,
    colors,
    info,
    context,
    link,
    diff,
  },
) {
  const benchmark = getBenchmark(group, benchmarks, { limits, diff })

  await Promise.all(
    reporters.map(({ report: reportFunc, opts: reportOpt }) =>
      useReporter({
        reportFunc,
        reportOpt,
        benchmark,
        output,
        insert,
        colors,
        info,
        context,
        link,
      }),
    ),
  )

  checkLimits(benchmark)

  return benchmark
}

const getBenchmark = function (group, benchmarks, { limits, diff }) {
  const benchmarksA = benchmarks.map((benchmark) => addPrintedInfo(benchmark))

  const benchmarkA = benchmarksA.find((benchmark) => benchmark.group === group)
  const benchmarkB = addPrevious(benchmarksA, benchmarkA, { limits, diff })
  return benchmarkB
}

// Perform each reporter
const useReporter = async function ({
  reportFunc,
  reportOpt,
  benchmark,
  output,
  insert,
  colors,
  info,
  context,
  link,
}) {
  const reportOptB = handleReportOpt({
    reportOpt,
    output,
    insert,
    colors,
    info,
    context,
    link,
  })

  const content = await reportFunc(benchmark, reportOptB)

  const contentA = handleColors(content, reportOptB)

  await handleContent(contentA, reportOptB)
}
