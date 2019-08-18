import { addPrintedInfo } from '../print/main.js'

import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmarks,
  benchmark,
  { report: reporters, output, insert, system, link, show, diff, verbose },
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
  system,
  link,
  show,
}) {
  // `output`, `insert`, `system`, link` can be set either for specific reporter
  // (--reporter.REPORTER.output) or for all (--output)
  const reportOptA = { output, insert, system, link, ...reportOpt, show }

  const content = await reportFunc(benchmark, reportOptA)

  await handleContent(content, reportOptA)
}
