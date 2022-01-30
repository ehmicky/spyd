import omit from 'omit.js'

import { FORMATS } from '../formats/list.js'

// Retrieve reporter's contents by calling all `reporter.report()` then
// normalizing their return value and grouping it by `output`.
export const getContents = async function ({ reporters }) {
  return await Promise.all(
    reporters.map((reporter) => callReportFunc({ reporter })),
  )
}

// Call all `reporter.report()`.
// It can be async, including during results preview.
// Some of this is currently applied only to `result`, not `result.history[*]`
// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
const callReportFunc = async function ({
  reporter,
  reporter: {
    result,
    footerString,
    startData,
    config: reporterConfig,
    config: { format, output, colors },
  },
}) {
  const reporterSpecificConfig = omit.default(
    reporterConfig,
    CORE_REPORTER_PROPS,
  )
  const content = await FORMATS[format].report(reporter, [
    result,
    reporterSpecificConfig,
    startData,
  ])
  return { content, result, format, footerString, output, colors }
}

// We only pass reporter-specific properties, not core ones
const CORE_REPORTER_PROPS = [
  'format',
  'tty',
  'output',
  'colors',
  'showTitles',
  'showSystem',
  'showMetadata',
  'showPrecision',
  'showDiff',
]
