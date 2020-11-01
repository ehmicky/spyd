// `output`, `insert`, `colors`, `info`, `context`,`link` can be set either for
// specific reporter (--report.REPORTER.output) or for all (--output)
export const handleReportOpt = function ({
  reportOpt,
  output,
  insert,
  colors,
  info,
  context,
  link,
}) {
  const reportOptA = {
    output,
    insert,
    colors,
    info,
    context,
    link,
    ...reportOpt,
  }
  const reportOptB = convertBooleans(reportOptA)
  return reportOptB
}

// --report.REPORTER.* options are dynamic, i.e. are not normalized by our
// options layer. Boolean options might be set on the CLI either as --[no-]OPT
// or --OPT true|false. We normalize both to a boolean value.
const convertBooleans = function (reportOpt) {
  const booleanOpts = Object.fromEntries(
    BOOLEAN_OPTS.map((name) => convertBoolean(name, reportOpt[name])),
  )
  return { ...reportOpt, ...booleanOpts }
}

const BOOLEAN_OPTS = ['colors', 'info', 'context', 'link']

const convertBoolean = function (name, value) {
  if (value === undefined) {
    return [name, value]
  }

  const valueA = value === true || value === 'true'
  return [name, valueA]
}
