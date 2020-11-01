import omit from 'omit.js'

// Call `reporter.report()`
export const callReportFunc = async function ({
  reportFunc,
  benchmark,
  reportOpt,
  reportOpt: { info, context },
}) {
  const reportFuncBenchmark = cleanBenchmark({ benchmark, info, context })
  const reportFuncOpts = omit(reportOpt, CORE_REPORT_OPTS)
  const content = await reportFunc(reportFuncBenchmark, reportFuncOpts)
  return content
}

// Remove some benchmark properties unless some reporter options are passed
const cleanBenchmark = function ({ benchmark, info, context }) {
  const omittedProps = [
    ...(info ? [] : INFO_PROPS),
    ...(context ? [] : CONTEXT_PROPS),
  ]
  return omit(benchmark, omittedProps)
}

const INFO_PROPS = ['systems', 'systemsPretty', 'commands', 'commandsPretty']
const CONTEXT_PROPS = [
  'git',
  'gitPretty',
  'ci',
  'ciPretty',
  'timestamp',
  'timestampPretty',
  'group',
]

// We handle some report options in core, and do not pass those to reporters.
const CORE_REPORT_OPTS = [
  'output',
  'insert',
  'info',
  'context',
  'link',
  'colors',
]
