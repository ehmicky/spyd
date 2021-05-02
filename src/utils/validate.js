import { inspect } from 'util'

import { validate, createDidYouMeanMessage } from 'jest-validate'

import { UserError } from '../error/main.js'

export const validateConfigProps = function (config, validateOpts) {
  validate(config, { ...validateOpts, unknown: throwOnUnknownProps })
}

// By default, jest-validate prints a warning on unknown properties but does
// not fail. With previews, the screen is cleared which means the warning does
// not appear. Therefore we override this behavior to fail instead.
// Runner config validation requires this behavior too since the runner's
// stdout/stderr is not printed.
// eslint-disable-next-line max-params
const throwOnUnknownProps = function (
  config,
  exampleConfig,
  propName,
  validateOpts,
  parentPropNames,
) {
  const propPath = [...parentPropNames, propName].join('.')
  const propValue = inspect(config[propName])
  const didYouMean = createDidYouMeanMessage(
    propName,
    Object.keys(exampleConfig),
  )
  throw new UserError(
    `Option "${propPath}" with value ${propValue} is unknown. ${didYouMean}`,
  )
}
