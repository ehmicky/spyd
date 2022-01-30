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
import { isOutputPath } from '../../report/contents/output.js'
import { DEFAULT_SHOW_PRECISION } from '../../report/normalize/omit.js'
import {
  DEFAULT_TITLES,
  DEFAULT_SHOW_TITLES,
} from '../../report/normalize/titles_add.js'
import { isTtyInput } from '../../report/tty.js'
import {
  validatePrecision,
  transformPrecision,
  DEFAULT_PRECISION,
} from '../../run/precision.js'
import { DEFAULT_SELECT } from '../../select/main.js'
import { DEFAULT_OUTLIERS } from '../../stats/outliers/main.js'
import { getShowMetadataDefault } from '../../top/omit.js'
import { getPluginsDefinitions } from '../plugin/definitions.js'
import { normalizeConfigSelectors } from '../select/normalize.js'

import { getPropCwd } from './cwd.js'
import { amongCommands } from './pick.js'
import { normalizeOptionalArray } from './transform.js'
import {
  validateBoolean,
  validateInteger,
  validateString,
  validateDefinedString,
  validateJson,
  validateObject,
  validateFileExists,
  validateRegularFile,
  validateDirectory,
  // eslint-disable-next-line import/max-dependencies
} from './validate.js'

// `config` has already been processed before, but it specified so it is shown
// in the valid list of known properties
const configProp = {
  name: 'config',
}

// All plugins definitions: `reporter`, `repoterConfig`, `runner`, etc.
const plugins = getPluginsDefinitions()

const colors = {
  name: 'colors',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateBoolean,
}

const cwd = {
  name: 'cwd',
  pick: amongCommands(['dev', 'remove', 'run', 'show']),
  default: getCwd,
  path: true,
  cwd: getPropCwd,
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

const output = {
  name: 'output',
  pick: amongCommands(['remove', 'run', 'show']),
  path: isOutputPath,
  cwd: getPropCwd,
  validate: validateRegularFile,
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
  validate(value) {
    validateInteger(value)
    validatePrecision(value)
  },
  transform: transformPrecision,
}

const quiet = {
  name: 'quiet',
  pick: amongCommands(['run']),
  validate: validateBoolean,
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

const showDiff = {
  name: 'showDiff',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateBoolean,
}

const showMetadata = {
  name: 'showMetadata',
  pick: amongCommands(['remove', 'run', 'show']),
  default: getShowMetadataDefault,
  validate: validateBoolean,
}

const showPrecision = {
  name: 'showPrecision',
  pick: amongCommands(['remove', 'run', 'show']),
  default: DEFAULT_SHOW_PRECISION,
  validate: validateBoolean,
}

const showSystem = {
  name: 'showSystem',
  pick: amongCommands(['remove', 'run', 'show']),
  validate: validateBoolean,
}

const showTitles = {
  name: 'showTitles',
  pick: amongCommands(['remove', 'run', 'show']),
  default: DEFAULT_SHOW_TITLES,
  validate: validateBoolean,
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

const tasks = {
  name: 'tasks',
  pick: amongCommands(['dev', 'run']),
  default: [],
  transform: normalizeOptionalArray,
}

const tasksAny = {
  name: 'tasks.*',
  pick: amongCommands(['dev', 'run']),
  path: true,
  glob: true,
  cwd: getPropCwd,
  validate: validateRegularFile,
}

const tasksFlatten = {
  name: 'tasks',
  pick: amongCommands(['dev', 'run']),
  transform(value) {
    return value.flat()
  },
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
  ...plugins,
  colors,
  configProp,
  cwd,
  delta,
  force,
  inputs,
  inputsAny,
  limit,
  merge,
  output,
  outliers,
  precision,
  quiet,
  save,
  select,
  selectAny,
  showDiff,
  showMetadata,
  showPrecision,
  showSystem,
  showTitles,
  since,
  system,
  systemAny,
  tasks,
  tasksAny,
  tasksFlatten,
  titles,
  titlesAny,
].flatMap(normalizeConfigSelectors)
/* eslint-enable max-lines */
