import { normalizeOptionalArray } from '../../config/normalize/transform.js'
import {
  validateObject,
  validateFunction,
} from '../../config/normalize/validate/complex.js'
import {
  validateBoolean,
  validateDefinedString,
} from '../../config/normalize/validate/simple.js'
import { DEFAULT_REPORTER_OUTPUT } from '../contents/output.js'
import { getReportMethods } from '../formats/list.js'

import { BUILTIN_REPORTERS, DEFAULT_REPORTERS } from './main.js'
import { sharedConfig } from './shared_config.js'

export const REPORTER_PLUGIN_TYPE = {
  type: 'reporter',
  varName: 'reporters',
  configProp: 'reporterConfig',
  modulePrefix: 'spyd-reporter-',
  commands: ['remove', 'run', 'show'],
  isCombinationDimension: false,
  builtins: BUILTIN_REPORTERS,
  selectProp: {
    name: 'reporter',
    default: DEFAULT_REPORTERS,
    transform(value, { config }) {
      return config.force ? [] : normalizeOptionalArray(value)
    },
  },
  mainShape: [
    ...getReportMethods().map((name) => ({
      name,
      validate: validateFunction,
    })),
    {
      name: 'capabilities',
      default: {},
      validate: validateObject,
    },
    {
      name: 'capabilities.debugStats',
      default: false,
      validate: validateBoolean,
    },
    {
      name: 'capabilities.history',
      default: false,
      validate: validateBoolean,
    },
    {
      name: 'defaultOutput',
      default: DEFAULT_REPORTER_OUTPUT,
      validate: validateDefinedString,
    },
  ],
  sharedConfig,
}
