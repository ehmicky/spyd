import omit from 'omit.js'

// Call `reporter.report()`
export const callReportFunc = async function ({
  reportFunc,
  result,
  reportOpt,
  reportOpt: { info, context },
}) {
  const reportFuncResult = cleanResult({ result, info, context })
  const reportFuncOpts = omit(reportOpt, CORE_REPORT_OPTS)
  const content = await reportFunc(reportFuncResult, reportFuncOpts)
  return content
}

// Remove some result properties unless some reporter options are passed
const cleanResult = function ({ result, info, context }) {
  const omittedProps = [
    ...(info ? [] : INFO_PROPS),
    ...(context ? [] : CONTEXT_PROPS),
  ]
  return omit(result, omittedProps)
}

const INFO_PROPS = ['systems', 'commands']
const CONTEXT_PROPS = ['git', 'ci', 'timestamp', 'mergeId']

// We handle some report options in core, and do not pass those to reporters.
const CORE_REPORT_OPTS = [
  'output',
  'insert',
  'info',
  'context',
  'link',
  'colors',
]
