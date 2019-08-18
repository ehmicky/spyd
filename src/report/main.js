import { addPrintedInfo } from '../print/main.js'

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
  // `output`, `insert`, `colors`, `system`, link` can be set either for
  // specific reporter (--report.REPORTER.output) or for all (--output)
  const reportOptA = {
    output,
    insert,
    colors,
    system,
    link,
    ...reportOpt,
    show,
  }

  const content = await reportFunc(benchmark, reportOptA)

  await handleContent(content, reportOptA)
}
