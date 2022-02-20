import {
  validateObject,
  validateFunction,
} from '../../../config/normalize/validate/complex.js'
import {
  validateBoolean,
  validateDefinedString,
} from '../../../config/normalize/validate/simple.js'
import { DEFAULT_REPORTER_OUTPUT } from '../../contents/output.js'
import { getReportMethods } from '../../formats/list.js'
import { BUILTIN_REPORTERS } from '../main.js'

import { item } from './item.js'

export const REPORTER_PLUGIN_TYPE = {
  name: 'reporter',
  pluginProp: 'id',
  modulePrefix: 'spyd-reporter',
  duplicates: true,
  builtins: BUILTIN_REPORTERS,
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
  item,
}
