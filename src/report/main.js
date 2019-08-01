import { REPORTERS } from './reporters/main.js'

// Report benchmark results
export const report = async function(benchmarks, { reporters, reportOpts }) {
  const reportersA = getDefaultReporters(reporters)

  const promises = reportersA.map(reporterName =>
    useReporter({ reporterName, benchmarks, reportOpts }),
  )
  await Promise.all(promises)
}

const getDefaultReporters = function(reporters) {
  if (reporters.length !== 0) {
    return reporters
  }

  return ['debug']
}

const useReporter = async function({ reporterName, benchmarks, reportOpts }) {
  const reporter = getReporter(reporterName)
  const reportOpt = getReportOpt(reporterName, reportOpts)
  const output = await reporter(benchmarks, reportOpt)
  printOutput(output)
}

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

const printOutput = function(output) {
  if (typeof output !== 'string' || output.trim() === '') {
    return
  }

  // eslint-disable-next-line no-console, no-restricted-globals
  console.log(output)
}
