/* eslint-disable max-lines */
import { cwd as getCwd } from 'process'

import { DEFAULT_INPUTS } from '../../combination/inputs.js'
import { transformLimit } from '../../history/compare/transform.js'
import { DEFAULT_SAVE } from '../../history/data/main.js'
import {
  transformDelta,
  DEFAULT_MAIN_DELTA,
  DEFAULT_SINCE_DELTA,
} from '../../history/delta/transform.js'
import { getDefaultId, validateMerge } from '../../history/merge/id.js'
import { DEFAULT_TITLES } from '../../report/normalize/titles_add.js'
import { isTtyInput } from '../../report/tty.js'
import { transformPrecision, DEFAULT_PRECISION } from '../../run/precision.js'
import { DEFAULT_SELECT } from '../../select/main.js'
import { DEFAULT_OUTLIERS } from '../../stats/outliers/main.js'
import { CONFIG_DEFINITIONS } from '../load/normalize.js'
import { getPluginsProps } from '../plugin/lib/main_props.js'

import { getDummyDefinitions, getDummyDefinitionsNames } from './dummy.js'
import { amongCommands } from './pick.js'
import { normalizeOptionalArray } from './transform.js'
import { validateJson, validateObject } from './validate/complex.js'
import { validateFileExists, validateDirectory } from './validate/fs.js'
import {
  validateBoolean,
  validateInteger,
  validateString,
  validateDefinedString,
  // eslint-disable-next-line import/max-dependencies
} from './validate/simple.js'

const configProps = getDummyDefinitions(CONFIG_DEFINITIONS)

// All plugins definitions: `reporter`, `reporterConfig`, `runner`, etc.
const plugins = getDummyDefinitionsNames(getPluginsProps())

const cwd = {
  name: 'cwd',
  pick: amongCommands(['dev', 'remove', 'run', 'show']),
  default: getCwd,
  path: true,
  async validate(value) {
    await validateFileExists(value)
    await validateDirectory(value)
  },
}

const delta = {
  name: 'delta',
  pick: amongCommands(['remove', 'show']),
  default: DEFAULT_MAIN_DELTA,
  transform: transformDelta,
}

const force = {
  name: 'force',
  pick: amongCommands(['remove']),
  default() {
    return !isTtyInput()
  },
  validate: validateBoolean,
}

const inputs = {
  name: 'inputs',
  pick: amongCommands(['dev', 'run']),
  default: DEFAULT_INPUTS,
  validate: validateObject,
}

const inputsAny = {
  name: 'inputs.*',
  pick: amongCommands(['dev', 'run']),
  validate: validateJson,
}

const limit = {
  name: 'limit',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateInteger,
  transform: transformLimit,
}

const merge = {
  name: 'merge',
  pick: amongCommands(['run']),
  default: getDefaultId,
  validate(value) {
    validateDefinedString(value)
    validateMerge(value)
  },
}

const outliers = {
  name: 'outliers',
  pick: amongCommands(['run']),
  default: DEFAULT_OUTLIERS,
  validate: validateBoolean,
}

const precision = {
  name: 'precision',
  pick: amongCommands(['run']),
  default: DEFAULT_PRECISION,
  validate: validateInteger,
  transform: transformPrecision,
}

const save = {
  name: 'save',
  pick: amongCommands(['run']),
  default: DEFAULT_SAVE,
  validate: validateBoolean,
}

const select = {
  name: 'select',
  pick: amongCommands(['dev', 'remove', 'run', 'show']),
  default: DEFAULT_SELECT,
  transform: normalizeOptionalArray,
}

const selectAny = {
  name: 'select.*',
  pick: amongCommands(['dev', 'remove', 'run', 'show']),
  validate: validateString,
}

const since = {
  name: 'since',
  pick: amongCommands(['remove', 'run', 'show']),
  default: DEFAULT_SINCE_DELTA,
  transform: transformDelta,
}

const system = {
  name: 'system',
  pick: amongCommands(['dev', 'run']),
  default: {},
  validate: validateObject,
}

const systemAny = {
  name: 'system.*',
  pick: amongCommands(['dev', 'run']),
  validate: validateDefinedString,
}

const titles = {
  name: 'titles',
  pick: amongCommands(['remove', 'run', 'show']),
  default: DEFAULT_TITLES,
  validate: validateObject,
}

const titlesAny = {
  name: 'titles.*',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateDefinedString,
}

export const DEFINITIONS = [
  ...configProps,
  ...plugins,
  cwd,
  delta,
  force,
  inputs,
  inputsAny,
  limit,
  merge,
  outliers,
  precision,
  save,
  select,
  selectAny,
  since,
  system,
  systemAny,
  titles,
  titlesAny,
]
/* eslint-enable max-lines */
