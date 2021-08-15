import { UserError } from '../../error/main.js'
import { groupBy } from '../../utils/group.js'
import { FORMATS } from '../format.js'

// It is possible to use "output" with multiple reporters at once.
// However, only specific formats support this. They declare it using the
// `concat` boolean property.
export const validateConcat = function (reporters) {
  Object.entries(groupBy(reporters, getOutput)).map(validateOutputConcat)
}

const getOutput = function ({ config: { output } }) {
  return output
}

const validateOutputConcat = function ([output, reporters]) {
  if (reporters.length < 2) {
    return
  }

  const invalidReporters = reporters.filter(reporterCannotConcat)

  if (invalidReporters.length === 0) {
    return
  }

  const reporterIds = invalidReporters.map(getReporterId).join(', ')
  throw new UserError(
    `Cannot use several reporters with "output" "${output}": ${reporterIds}`,
  )
}

const reporterCannotConcat = function ({ format }) {
  return !FORMATS[format].concat
}

const getReporterId = function ({ id }) {
  return id
}

// Concatenate the contents of multiple reporters with the same "output"
export const concatContents = function (contents) {
  return contents.join(CONTENTS_DELIMITER)
}

const CONTENTS_DELIMITER = '\n'
