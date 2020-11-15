import { checkLimits } from '../limit/error.js'
import { normalizeBenchmark } from '../print/main.js'
import { addPrevious } from '../print/previous.js'

import { callReportFunc } from './call.js'
import { getContents } from './content.js'
import { insertContent } from './insert.js'
import { handleReportOpt } from './options.js'
import { printContent } from './print.js'

// Report benchmark results
export const report = async function (
  mergeId,
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
  const benchmark = getBenchmark(mergeId, benchmarks, { limits, diff })

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

const getBenchmark = function (mergeId, benchmarks, { limits, diff }) {
  const benchmarksA = benchmarks.map(normalizeBenchmark)

  const benchmarkA = benchmarksA.find(
    (benchmark) => benchmark.mergeId === mergeId,
  )
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
  const reportOptA = handleReportOpt({
    reportOpt,
    output,
    insert,
    colors,
    info,
    context,
    link,
  })

  const content = await callReportFunc({
    reportFunc,
    benchmark,
    reportOpt: reportOptA,
  })

  if (!hasContent(content)) {
    return
  }

  const { nonInteractiveContent, interactiveContent } = getContents({
    content,
    reportOpt: reportOptA,
  })
  await Promise.all([
    printContent({ nonInteractiveContent, interactiveContent, output }),
    insertContent(nonInteractiveContent, insert),
  ])
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
