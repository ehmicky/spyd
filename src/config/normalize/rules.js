/* eslint-disable max-lines */
import { cwd as getCwd } from 'node:process'

import {
  DEFAULT_INPUTS,
  EXAMPLE_INPUTS,
  EXAMPLE_INPUT_VALUE,
} from '../../combination/inputs.js'
import {
  transformLimit,
  EXAMPLE_LIMIT,
} from '../../history/compare/transform.js'
import { DEFAULT_SAVE } from '../../history/data/main.js'
import {
  transformDelta,
  DEFAULT_MAIN_DELTA,
  DEFAULT_SINCE_DELTA,
} from '../../history/delta/transform.js'
import { getDefaultId, LAST_ID } from '../../history/merge/id.js'
import {
  DEFAULT_TITLES,
  EXAMPLE_TITLES,
  EXAMPLE_TITLE,
} from '../../report/normalize/titles_add.js'
import { DEFAULT_REPORTERS } from '../../report/reporters/main.js'
import { isTtyInput } from '../../report/tty.js'
import {
  transformPrecision,
  DEFAULT_PRECISION,
  MIN_PRECISION,
  MAX_PRECISION,
} from '../../run/precision.js'
import { DEFAULT_RUNNERS } from '../../runners/main.js'
import { DEFAULT_SELECT, EXAMPLE_SELECT } from '../../select/main.js'
import { DEFAULT_OUTLIERS } from '../../stats/outliers/main.js'
import { EXAMPLE_SYSTEMS, EXAMPLE_SYSTEM } from '../../top/system/example.js'
import { CONFIG_RULES } from '../load/normalize.js'
import { normalizeConfigSelectors } from '../select/normalize.js'

import { getDummyRules } from './dummy.js'
import { amongCommands } from './pick.js'
import { normalizeArray } from './transform.js'
// eslint-disable-next-line import/max-dependencies
import { validateJson } from './validate/json.js'

const rules = new Set([
  getDummyRules(CONFIG_RULES),
  {
    name: 'cwd',
    pick: amongCommands(['dev', 'remove', 'run', 'show']),
    default: getCwd,
    path: ['exist', 'directory'],
  },
  {
    name: 'delta',
    pick: amongCommands(['remove', 'show']),
    default: DEFAULT_MAIN_DELTA,
    transform: transformDelta,
  },
  [
    {
      name: 'force',
      pick: amongCommands(['remove']),
      default: () => !isTtyInput(),
      schema: { type: 'boolean' },
    },
    {
      name: 'reporter',
      pick: amongCommands(['remove', 'run', 'show']),
      default: DEFAULT_REPORTERS,
      transform: (value, { inputs: { force: forceProp } }) =>
        forceProp ? [] : value,
    },
  ],
  [
    {
      name: 'inputs',
      pick: amongCommands(['dev', 'run']),
      default: DEFAULT_INPUTS,
      schema: { type: 'object' },
      example: EXAMPLE_INPUTS,
    },
    {
      name: 'inputs.*',
      pick: amongCommands(['dev', 'run']),
      validate: validateJson,
      example: EXAMPLE_INPUT_VALUE,
    },
  ],
  {
    name: 'limit',
    pick: amongCommands(['remove', 'run', 'show']),
    schema: { type: 'integer' },
    transform: transformLimit,
    example: EXAMPLE_LIMIT,
  },
  {
    name: 'id',
    pick: amongCommands(['run']),
    default: getDefaultId,
    schema: {
      type: 'string',
      minLength: 1,
      oneOf: [{ format: 'uuid' }, { const: LAST_ID }],
      errorMessage: {
        minLength: 'must not be an empty string',
        _: `must be "${LAST_ID}" or a UUID`,
      },
    },
  },
  {
    name: 'outliers',
    pick: amongCommands(['run']),
    default: DEFAULT_OUTLIERS,
    schema: { type: 'boolean' },
  },
  {
    name: 'precision',
    pick: amongCommands(['run']),
    default: DEFAULT_PRECISION,
    schema: { type: 'integer', minimum: MIN_PRECISION, maximum: MAX_PRECISION },
    transform: transformPrecision,
  },
  {
    name: 'save',
    pick: amongCommands(['run']),
    default: DEFAULT_SAVE,
    schema: { type: 'boolean' },
  },
  [
    {
      name: 'select',
      pick: amongCommands(['dev', 'remove', 'run', 'show']),
      default: DEFAULT_SELECT,
      transform: normalizeArray,
      example: EXAMPLE_SELECT,
    },
    {
      name: 'select.*',
      required: true,
      pick: amongCommands(['dev', 'remove', 'run', 'show']),
      schema: { type: 'string' },
      example: EXAMPLE_SELECT,
    },
  ],
  {
    name: 'since',
    pick: amongCommands(['remove', 'run', 'show']),
    default: DEFAULT_SINCE_DELTA,
    transform: transformDelta,
  },
  [
    {
      name: 'system',
      pick: amongCommands(['dev', 'run']),
      default: {},
      schema: { type: 'object' },
      example: EXAMPLE_SYSTEMS,
    },
    {
      name: 'system.*',
      pick: amongCommands(['dev', 'run']),
      schema: {
        type: 'string',
        minLength: 1,
        errorMessage: { minLength: 'must not be an empty string' },
      },
      example: EXAMPLE_SYSTEM,
    },
  ],
  [
    {
      name: 'titles',
      pick: amongCommands(['remove', 'run', 'show']),
      default: DEFAULT_TITLES,
      schema: { type: 'object' },
      example: EXAMPLE_TITLES,
    },
    {
      name: 'titles.*',
      pick: amongCommands(['remove', 'run', 'show']),
      schema: {
        type: 'string',
        minLength: 1,
        errorMessage: { minLength: 'must not be an empty string' },
      },
      example: EXAMPLE_TITLE,
    },
  ],
  {
    name: 'runner',
    pick: amongCommands(['dev', 'run']),
    default: DEFAULT_RUNNERS,
    schema: {
      if: { type: 'array' },
      // eslint-disable-next-line unicorn/no-thenable
      then: { type: 'array', minItems: 1 },
      errorMessage: 'must not be an empty array',
    },
  },
])

export const RULES = normalizeConfigSelectors(rules)
/* eslint-enable max-lines */
