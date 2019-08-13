import { validate } from 'jest-validate'

import { omitBy } from '../../utils/main.js'

export const getOpts = function(runOpts) {
  const runOptsA = omitBy(runOpts, isUndefined)

  validate(runOptsA, { exampleConfig: EXAMPLE_OPTS })

  return runOptsA
}

const isUndefined = function(value) {
  return value === undefined
}

const EXAMPLE_OPTS = {
  versions: '12 10.5.0 8.0.0',
}
