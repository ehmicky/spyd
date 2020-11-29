import omit from 'omit.js'

// Call `reporter.report()`
export const callReportFunc = async function ({
  reportFunc,
  result,
  reportConfig,
  reportConfig: { info, context },
}) {
  const reportFuncResult = cleanResult({ result, info, context })
  const reportFuncProps = omit(reportConfig, CORE_REPORT_PROPS)
  const content = await reportFunc(reportFuncResult, reportFuncProps)
  return content
}

// Remove some result properties unless some reportConfig properties are passed
const cleanResult = function ({ result, info, context }) {
  const omittedProps = [
    ...(info ? [] : INFO_PROPS),
    ...(context ? [] : CONTEXT_PROPS),
  ]
  return omit(result, omittedProps)
}

const INFO_PROPS = ['systems', 'commands']
const CONTEXT_PROPS = ['git', 'ci', 'timestamp', 'mergeId']

// We handle some reportConfig properties in core, and do not pass those to
// reporters.
const CORE_REPORT_PROPS = [
  'output',
  'insert',
  'info',
  'context',
  'link',
  'colors',
]
