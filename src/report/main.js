import { normalizeBenchmark } from '../print/main.js'

import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmark,
  {
    report: reporters,
    output,
    insert,
    system,
    link,
    show,
    diff,
    dataDir,
    store,
    verbose,
  },
) {
  const benchmarkA = await normalizeBenchmark(
    { show, diff, dataDir, store, verbose },
    benchmark,
  )

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
}) {
  // `output`, `insert`, `system`, link` can be set either for specific reporter
  // (--reporter.REPORTER.output) or for all (--output)
  const reportOptA = { output, insert, system, link, ...reportOpt }

  const content = await reportFunc(benchmark, reportOptA)

  await handleContent(content, reportOptA)
}
