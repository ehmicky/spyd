import { addPrintedInfo } from '../print/main.js'

import { getChalk } from './colors.js'
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

  const reportOptB = convertBooleans(reportOptA)

  const reportOptC = getChalk(reportOptB)

  const content = await reportFunc(benchmark, reportOptC)

  await handleContent(content, reportOptC)
}

// --report.REPORTER.* options are dynamic, i.e. are not normalized by our
// options layer. Boolean options might be set on the CLI either as --[no-]OPT
// or --OPT true|false. We normalize both to a boolean value.
const convertBooleans = function(reportOpt) {
  return Object.fromEntries(
    BOOLEAN_OPTS.map(name => convertBoolean(name, reportOpt[name])),
  )
}

const BOOLEAN_OPTS = ['colors', 'system', 'link']

const convertBoolean = function(name, value) {
  const valueA = value === true || value === 'true'
  return [name, valueA]
}
