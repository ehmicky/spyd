import { REPORTERS } from './reporters/main.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmarks,
  { reporters, reportOpts, output, insert },
) {
  const reportersA = getDefaultReporters(reporters)

  const promises = reportersA.map(reporterName =>
    useReporter({ reporterName, benchmarks, reportOpts, output, insert }),
  )
  await Promise.all(promises)
}

const getDefaultReporters = function(reporters) {
  if (reporters.length !== 0) {
    return reporters
  }

  return ['debug']
}

// Perform each reporter
const useReporter = async function({
  reporterName,
  benchmarks,
  reportOpts,
  output,
  insert,
}) {
  const reporter = getReporter(reporterName)
  const reportOpt = getReportOpt(reporterName, reportOpts)

  const content = await reporter(benchmarks, reportOpt)

  await handleContent({ content, reportOpt, output, insert })
}

// Retrieve reporter's main function
const getReporter = function(reporterName) {
  if (REPORTERS[reporterName] !== undefined) {
    return REPORTERS[reporterName]
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(reporterName)
  } catch (error) {
    throw new Error(
      `Could not load reporter '${reporterName}'\n\n${error.stack}`,
    )
  }
}

const getReportOpt = function(reporterName, reportOpt) {
  const reporterOpt = reportOpt[reporterName]

  if (reporterOpt === undefined) {
    return {}
  }

  return reporterOpt
}
