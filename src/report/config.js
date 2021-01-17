// `output`, `insert`, `colors`, `showDiff`, `showSystem`, `showMetadata`,
// `link` can be set either for specific reporter (--report.REPORTER.output) or
// for all (--output)
export const handleReportConfig = function (
  reportConfig,
  { output, insert, colors, showDiff, link, showSystem, showMetadata },
) {
  const reportConfigA = {
    output,
    insert,
    colors,
    showDiff,
    link,
    showSystem,
    showMetadata,
    ...reportConfig,
  }
  const reportConfigB = convertBooleans(reportConfigA)
  return reportConfigB
}

// --report.REPORTER.* properties are dynamic, i.e. are not normalized by our
// config layer. Boolean properties might be set on the CLI either as --[no-]VAR
// or --VAR true|false. We normalize both to a boolean value.
const convertBooleans = function (reportConfig) {
  const booleanConfig = Object.fromEntries(
    BOOLEAN_PROPS.map((name) => convertBoolean(name, reportConfig[name])),
  )
  return { ...reportConfig, ...booleanConfig }
}

const BOOLEAN_PROPS = [
  'colors',
  'showDiff',
  'showSystem',
  'showMetadata',
  'link',
]

const convertBoolean = function (name, value) {
  if (value === undefined) {
    return [name, value]
  }

  const valueA = value === true || value === 'true'
  return [name, valueA]
}
