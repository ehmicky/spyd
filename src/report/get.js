import { REPORTERS } from './reporters/main.js'

// Retrieve reporters method and options
// `output`, `insert`, `system`, link` can be set either for specific reporter
// (--reporter.REPORTER.output) or for all (--output)
export const getReporters = function({
  reporters,
  reportOpts,
  output,
  insert,
  system,
  link,
}) {
  const reportersA = getDefaultReporters(reporters)
  return reportersA.map(name =>
    getReporter({ name, reportOpts, output, insert, system, link }),
  )
}

const getDefaultReporters = function(reporters) {
  if (reporters.length !== 0) {
    return reporters
  }

  return ['debug']
}

// Retrieve reporter's main function
const getReporter = function({
  name,
  reportOpts,
  output,
  insert,
  system,
  link,
}) {
  const main = loadReporter(name)
  const reportOpt = { output, insert, system, link, ...reportOpts[name] }
  return { main, reportOpt }
}

const loadReporter = function(name) {
  if (REPORTERS[name] !== undefined) {
    return REPORTERS[name]
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(name)
  } catch (error) {
    throw new Error(`Could not load reporter '${name}'\n\n${error.stack}`)
  }
}
