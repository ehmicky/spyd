import { addFooter } from '../../system/footer/main.js'
import { omitMetadataProps } from '../../system/omit.js'

import { normalizeNonCombAll, normalizeNonCombEach } from './common.js'

// Add report-specific properties to the target result, except for
// `combinations` since this is applied before measuring and history merging
// have been performed.
// This is only computed once at the beginning of the command.
export const normalizeTargetResult = function (result, config) {
  const resultA = normalizeNonCombAll(result)
  const reporters = config.reporters.map((reporter) =>
    normalizeTargetEach(resultA, reporter, config),
  )
  const resultB = omitMetadataProps(resultA)
  return { result: resultB, config: { ...config, reporters } }
}

// Add report-specific properties to the target result that are not
// `combinations` related but are reporter-specific.
// This is saved to `reporter.resultProps` and merged later.
// Footers are only applied to the target result, not the history results, since
// they are not very useful for those.
const normalizeTargetEach = function (result, reporter, config) {
  const resultProps = normalizeNonCombEach(result, reporter)
  const reporterA = addFooter({ result, resultProps, reporter, config })
  return { ...reporterA, resultProps }
}
