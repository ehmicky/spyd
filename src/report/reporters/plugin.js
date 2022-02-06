import { amongCommands } from '../../config/normalize/pick.js'
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
import { sharedProps } from './shared_props.js'

const pick = amongCommands(['remove', 'run', 'show'])

export const REPORTER_PLUGIN_TYPE = {
  type: 'reporter',
  modulePrefix: 'spyd-reporter-',
  multiple: true,
  shape: [
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
  builtins: BUILTIN_REPORTERS,
  selectProp: {
    name: 'reporter',
    pick,
    default: DEFAULT_REPORTERS,
    transform(value, { config }) {
      return config.force ? [] : normalizeOptionalArray(value)
    },
  },
  configProp: {
    name: 'reporterConfig',
    pick,
  },
  sharedProps,
}
