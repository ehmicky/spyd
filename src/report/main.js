import { REPORTERS } from './reporters/main.js'

// Report benchmark results
export const report = async function(benchmarks, { reporters }) {
  const reportersA = getDefaultReporters(reporters)

  const promises = reportersA.map(reporterName =>
    useReporter(reporterName, benchmarks),
  )
  await Promise.all(promises)
}

const getDefaultReporters = function(reporters) {
  if (reporters.length !== 0) {
    return reporters
  }

  return ['debug']
}

const useReporter = async function(reporterName, benchmarks) {
  const reporter = getReporter(reporterName)
  const output = await reporter(benchmarks)
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

const printOutput = function(output) {
  if (typeof output !== 'string' || output.trim() === '') {
    return
  }

  // eslint-disable-next-line no-console, no-restricted-globals
  console.log(output)
}
