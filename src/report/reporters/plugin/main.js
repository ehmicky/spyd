import { DEFAULT_REPORTER_OUTPUT } from '../../contents/output.js'
import { getReportMethods } from '../../formats/list.js'
import { BUILTIN_REPORTERS } from '../main.js'

import { shared } from './shared.js'

export const REPORTER_PLUGIN_TYPE = {
  name: 'reporter',
  modulePrefix: 'spyd-reporter',
  duplicates: true,
  builtins: BUILTIN_REPORTERS,
  shape: new Set([
    ...getReportMethods().map((name) => ({
      name,
      schema: { typeof: 'function', errorMessage: 'must be a function' },
    })),
    [
      {
        name: 'capabilities',
        default: {},
        schema: { type: 'object' },
      },
      new Set([
        {
          name: 'capabilities.debugStats',
          default: false,
          schema: { type: 'boolean' },
        },
        {
          name: 'capabilities.history',
          default: false,
          schema: { type: 'boolean' },
        },
      ]),
    ],
    {
      name: 'defaultOutput',
      default: DEFAULT_REPORTER_OUTPUT,
      schema: {
        type: 'string',
        minLength: 1,
        errorMessage: { minLength: 'must not be an empty string' },
      },
    },
  ]),
  shared,
}
