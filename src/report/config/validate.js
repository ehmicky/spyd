import { UserError } from '../../error/main.js'
import { groupBy } from '../../utils/group.js'
import { FORMATS } from '../formats/list.js'

// It is possible to use `output` with multiple reporters at once.
// However, reporters with the same `output` have additional logic, which means
// they require additional validation.
export const validateOutputGroups = function (reporters) {
  Object.entries(groupBy(reporters, getOutput)).map(validateOutputGroup)
}

const getOutput = function ({ config: { output } }) {
  return output
}

const validateOutputGroup = function ([output, reporters]) {
  if (reporters.length < 2) {
    return
  }

  validateConcatGroup(output, reporters)
  validatePropsGroup(output, reporters)
}

// Only specific formats support multiple reporters per `output`.
// They declare it using the `concat` boolean property.
const validateConcatGroup = function (output, reporters) {
  const invalidReporters = reporters.filter(reporterCannotConcat)

  if (invalidReporters.length === 0) {
    return
  }

  const reporterIds = invalidReporters.map(getReporterId).join(', ')
  throw new UserError(
    `Cannot use several reporters with "output" "${output}": ${reporterIds}`,
  )
}

const reporterCannotConcat = function ({ config: { format } }) {
  return !FORMATS[format].concat
}

const getReporterId = function ({ id }) {
  return id
}

// Some configuration properties are used once per `output`. Therefore all
// reporters with the same `output` must have the same value for those.
const validatePropsGroup = function (output, reporters) {
  GROUP_SAME_PROPS.forEach((propName) => {
    validatePropGroup(propName, output, reporters)
  })
}

// Those properties must have default value for a given output.
const GROUP_SAME_PROPS = ['colors', 'showSystem', 'showMetadata']

const validatePropGroup = function (
  propName,
  output,
  [firstReporter, ...reporters],
) {
  const invalidReporter = reporters.find(
    (reporter) => reporter.config[propName] !== firstReporter.config[propName],
  )

  if (invalidReporter !== undefined) {
    throw new UserError(`The reporters "${firstReporter.id}" and "${invalidReporter.id}" use the same "output".
Therefore, they must not use different values for the "${propName}" configuration property.`)
  }
}
