import { REPORTERS } from './reporters/main.js'

// Retrieve reporters method and options
// `output`, `insert`, `system`, link` can be set either for specific reporter
// (--reporter.REPORTER.output) or for all (--output)
export const getReporters = function(reportOpts) {
  return Object.entries(reportOpts).map(([name, reportOpt]) =>
    getReporter({ name, reportOpt }),
  )
}

// Retrieve reporter's main function
const getReporter = function({ name, reportOpt }) {
  const { report } = loadReporter(name)
  return { report, reportOpt }
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
