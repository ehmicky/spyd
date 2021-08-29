import { addFooter } from '../../system/footer.js'
import { omitMetadataProps } from '../../system/omit.js'
import { addScreenInfo } from '../tty.js'

import { normalizeNonCombAll, normalizeNonCombEach } from './common.js'

// Add report-specific properties to the target result, except for
// `combinations` since this is applied before measuring and history merging
// have been performed.
// This is only computed once at the beginning of the command.
export const normalizeTargetResult = function (result, mergedResult, config) {
  const resultA = normalizeNonCombAll(result)
  const reporters = config.reporters.map((reporter) =>
    normalizeTargetEach({ result: resultA, mergedResult, reporter, config }),
  )
  const resultB = omitMetadataProps(resultA)
  const resultC = addScreenInfo(resultB)
  return { result: resultC, config: { ...config, reporters } }
}

// Add report-specific properties to the target result that are not
// `combinations` related but are reporter-specific.
// This is saved to `reporter.resultProps` and merged later.
// Footers are only applied to the target result, not the history results, since
// they are not very useful for those.
const normalizeTargetEach = function ({
  result,
  mergedResult,
  reporter,
  config,
}) {
  const resultProps = normalizeNonCombEach(result, reporter)
  const reporterA = addFooter({ result, mergedResult, reporter, config })
  return { ...reporterA, resultProps }
}
