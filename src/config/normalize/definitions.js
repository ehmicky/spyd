/* eslint-disable max-lines */
import { cwd as getCwd } from 'process'

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
import { getDefaultId, validateMerge } from '../../history/merge/id.js'
import {
  DEFAULT_TITLES,
  EXAMPLE_TITLES,
  EXAMPLE_TITLE,
} from '../../report/normalize/titles_add.js'
import { DEFAULT_REPORTERS } from '../../report/reporters/main.js'
import { isTtyInput } from '../../report/tty.js'
import { transformPrecision, DEFAULT_PRECISION } from '../../run/precision.js'
import { DEFAULT_RUNNERS } from '../../runners/main.js'
import { DEFAULT_SELECT, EXAMPLE_SELECT } from '../../select/main.js'
import { DEFAULT_OUTLIERS } from '../../stats/outliers/main.js'
import { EXAMPLE_SYSTEMS, EXAMPLE_SYSTEM } from '../../top/system/example.js'
import { CONFIG_DEFINITIONS } from '../load/normalize.js'
import { normalizeConfigSelectors } from '../select/normalize.js'

import { getDummyDefinitions } from './dummy.js'
import { amongCommands } from './pick.js'
import { normalizeArray } from './transform.js'
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

const runner = {
  name: 'runner',
  pick: amongCommands(['dev', 'run']),
  default: DEFAULT_RUNNERS,
}

const reporter = {
  name: 'reporter',
  pick: amongCommands(['remove', 'run', 'show']),
  default: DEFAULT_REPORTERS,
}

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
  example: EXAMPLE_INPUTS,
}

const inputsAny = {
  name: 'inputs.*',
  pick: amongCommands(['dev', 'run']),
  validate: validateJson,
  example: EXAMPLE_INPUT_VALUE,
}

const limit = {
  name: 'limit',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateInteger,
  transform: transformLimit,
  example: EXAMPLE_LIMIT,
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
  transform: normalizeArray,
  example: EXAMPLE_SELECT,
}

const selectAny = {
  name: 'select.*',
  pick: amongCommands(['dev', 'remove', 'run', 'show']),
  validate: validateString,
  example: EXAMPLE_SELECT,
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
  example: EXAMPLE_SYSTEMS,
}

const systemAny = {
  name: 'system.*',
  pick: amongCommands(['dev', 'run']),
  validate: validateDefinedString,
  example: EXAMPLE_SYSTEM,
}

const titles = {
  name: 'titles',
  pick: amongCommands(['remove', 'run', 'show']),
  default: DEFAULT_TITLES,
  validate: validateObject,
  example: EXAMPLE_TITLES,
}

const titlesAny = {
  name: 'titles.*',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateDefinedString,
  example: EXAMPLE_TITLE,
}

export const DEFINITIONS = [
  ...configProps,
  runner,
  reporter,
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
].flatMap(normalizeConfigSelectors)
/* eslint-enable max-lines */
