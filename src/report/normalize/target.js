import { computeFooter } from '../../top/footer/main.js'
import { omitMetadataFooterProps } from '../../top/omit.js'
import { mergeSystems } from '../../top/system/merge.js'

import { normalizeNonCombAll, normalizeNonCombEach } from './common.js'

// Add report-specific properties to the target result, except for
// `combinations` since this is applied before measuring and history merging
// have been performed.
// This is only computed once at the beginning of the command.
export const normalizeTargetResult = function (result, config) {
  const systems = mergeSystems(result)
  const resultA = normalizeNonCombAll(result)
  const reporters = config.reporters.map((reporter) =>
    normalizeTargetEach({ result: resultA, systems, reporter, config }),
  )
  const resultB = omitMetadataFooterProps(resultA)
  return { result: resultB, config: { ...config, reporters } }
}

// Add report-specific properties to the target result that are not
// `combinations` related but are reporter-specific.
// This is saved to `reporter.resultProps` and merged later.
const normalizeTargetEach = function ({ result, systems, reporter, config }) {
  const { timestamp, ...resultProps } = normalizeNonCombEach(result, reporter)
  const reporterA = computeFooter({
    result,
    systems,
    timestamp,
    reporter,
    config,
  })
  return { ...reporterA, resultProps }
}
