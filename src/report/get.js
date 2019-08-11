import { REPORTERS } from './reporters/main.js'

// Retrieve reporters method and options
// `output`, `insert`, `system`, link` can be set either for specific reporter
// (--reporter.REPORTER.output) or for all (--output)
export const getReporters = function({
  reportOpts,
  output,
  insert,
  system,
  link,
}) {
  return Object.entries(reportOpts).map(([name, reportOpt]) =>
    getReporter({ name, reportOpt, output, insert, system, link }),
  )
}

// Retrieve reporter's main function
const getReporter = function({
  name,
  reportOpt,
  output,
  insert,
  system,
  link,
}) {
  const main = loadReporter(name)
  const reportOptA = { output, insert, system, link, ...reportOpt }
  return { main, reportOpt: reportOptA }
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
