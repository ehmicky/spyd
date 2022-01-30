/* eslint-disable max-lines */
import { cwd as getCwd } from 'process'

import { transformLimit } from '../../history/compare/transform.js'
import { transformDelta } from '../../history/delta/transform.js'
import { getDefaultId, validateMerge } from '../../history/merge/id.js'
import { isOutputPath } from '../../report/output.js'
import { isTtyInput } from '../../report/tty.js'
import { transformPrecision } from '../../run/precision.js'
import { getDefaultConfig } from '../load/default.js'
import { recurseConfigSelectors } from '../select/normalize.js'

import { normalizeConfigPath, normalizeConfigGlob } from './path.js'
import { normalizeOptionalArray } from './transform.js'
import {
  validateBoolean,
  validateInteger,
  validateString,
  validateEmptyArray,
  validateDefinedString,
  validateJson,
  validateObject,
  // eslint-disable-next-line import/max-dependencies
} from './validate.js'

// Used a `condition()` to filter a configuration property for specific commands
// All config properties can be specified in `spyd.yml` (unlike CLI flags), for
// any commands.
// Therefore, we need to filter them out depending on the current command.
const amongCommands = function (commands) {
  return boundAmongCommands.bind(undefined, new Set(commands))
}

const boundAmongCommands = function (
  commands,
  value,
  { context: { command } },
) {
  return commands.has(command)
}

const configProp = {
  name: 'config',
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: getDefaultConfig,
  transform: normalizeOptionalArray,
}

const configAny = {
  name: 'config[*]',
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  validate: validateDefinedString,
}

const colors = {
  name: 'colors',
  condition: amongCommands(['remove', 'run', 'show']),
  validate: validateBoolean,
}

const cwd = {
  name: 'cwd',
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: getCwd,
  validate: validateDefinedString,
  transform(value, { name, context: { configInfos } }) {
    return normalizeConfigPath(value, name, configInfos)
  },
}

const delta = {
  name: 'delta',
  condition: amongCommands(['remove', 'show']),
  default: 1,
  transform: transformDelta,
}

const force = {
  name: 'force',
  condition: amongCommands(['remove']),
  default() {
    return !isTtyInput()
  },
  validate: validateBoolean,
}

const inputs = {
  name: 'inputs',
  condition: amongCommands(['dev', 'run']),
  default: {},
  validate: validateObject,
}

const inputsAny = {
  name: 'inputs.*',
  condition: amongCommands(['dev', 'run']),
  validate: validateJson,
}

const limit = {
  name: 'limit',
  condition: amongCommands(['remove', 'run', 'show']),
  validate(value, { name }) {
    recurseConfigSelectors(value, name, validateInteger)
  },
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) =>
      transformLimit(childValue, childName),
    )
  },
}

const merge = {
  name: 'merge',
  condition: amongCommands(['run']),
  default: getDefaultId,
  validate(value) {
    validateDefinedString(value)
    validateMerge(value)
  },
}

const output = {
  name: 'output',
  condition: amongCommands(['remove', 'run', 'show']),
  validate: validateDefinedString,
  transform(value, { name, context: { configInfos } }) {
    return isOutputPath(value)
      ? normalizeConfigPath(value, name, configInfos)
      : value
  },
}

const outliers = {
  name: 'outliers',
  condition: amongCommands(['run']),
  default: false,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, validateBoolean)
  },
}

const precision = {
  name: 'precision',
  condition: amongCommands(['run']),
  default: 5,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, validateInteger)
  },
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) =>
      transformPrecision(childValue, childName),
    )
  },
}

const quiet = {
  name: 'quiet',
  condition: amongCommands(['run']),
  validate: validateBoolean,
}

const reporter = {
  name: 'reporter',
  condition: amongCommands(['remove', 'run', 'show']),
  default: ['debug'],
  transform(value, { config }) {
    return config.force ? [] : normalizeOptionalArray(value)
  },
}

const reporterAny = {
  name: 'reporter[*]',
  condition: amongCommands(['remove', 'run', 'show']),
  validate: validateDefinedString,
}

const reporterConfig = {
  name: 'reporterConfig',
  condition: amongCommands(['remove', 'run', 'show']),
  default: {},
  validate: validateObject,
}

const runner = {
  name: 'runner',
  condition: amongCommands(['dev', 'run']),
  // We default `runner` to `node` only instead of several ones (e.g. `cli`)
  // because this enforces that the `runner` property points to a required tasks
  // file, instead of to an optional one. This makes behavior easier to
  // understand for users and provides with better error messages.
  default: ['node'],
  validate: validateEmptyArray,
  transform: normalizeOptionalArray,
}

const runnerAny = {
  name: 'runner[*]',
  condition: amongCommands(['dev', 'run']),
  validate: validateDefinedString,
}

const runnerConfig = {
  name: 'runnerConfig',
  condition: amongCommands(['dev', 'run']),
  default: {},
  validate: validateObject,
}

const save = {
  name: 'save',
  condition: amongCommands(['run']),
  default: false,
  validate: validateBoolean,
}

const select = {
  name: 'select',
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: [],
  transform: normalizeOptionalArray,
}

const selectAny = {
  name: 'select[*]',
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  validate: validateString,
}

const showDiff = {
  name: 'showDiff',
  condition: amongCommands(['remove', 'run', 'show']),
  validate(value, { name }) {
    recurseConfigSelectors(value, name, validateBoolean)
  },
}

const showMetadata = {
  name: 'showMetadata',
  condition: amongCommands(['remove', 'run', 'show']),
  default({ context: { command } }) {
    return command !== 'run'
  },
  validate: validateBoolean,
}

const showPrecision = {
  name: 'showPrecision',
  condition: amongCommands(['remove', 'run', 'show']),
  default: false,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, validateBoolean)
  },
}

const showSystem = {
  name: 'showSystem',
  condition: amongCommands(['remove', 'run', 'show']),
  validate: validateBoolean,
}

const showTitles = {
  name: 'showTitles',
  condition: amongCommands(['remove', 'run', 'show']),
  default: false,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, validateBoolean)
  },
}

const since = {
  name: 'since',
  condition: amongCommands(['remove', 'run', 'show']),
  default: 1,
  transform: transformDelta,
}

const system = {
  name: 'system',
  condition: amongCommands(['dev', 'run']),
  default: {},
  validate: validateObject,
}

const systemAny = {
  name: 'system.*',
  condition: amongCommands(['dev', 'run']),
  validate: validateDefinedString,
}

const tasks = {
  name: 'tasks',
  condition: amongCommands(['dev', 'run']),
  default: [],
  transform: normalizeOptionalArray,
}

const tasksAny = {
  name: 'tasks[*]',
  condition: amongCommands(['dev', 'run']),
  validate: validateDefinedString,
  async transform(value, { name, context: { configInfos } }) {
    return await normalizeConfigGlob(value, name, configInfos)
  },
}

const tasksFlatten = {
  name: 'tasks',
  condition: amongCommands(['dev', 'run']),
  transform(value) {
    return value.flat()
  },
}

const titles = {
  name: 'titles',
  condition: amongCommands(['remove', 'run', 'show']),
  default: {},
  validate: validateObject,
}

const titlesAny = {
  name: 'titles.*',
  condition: amongCommands(['remove', 'run', 'show']),
  validate: validateDefinedString,
}

export const DEFINITIONS = [
  colors,
  configProp,
  configAny,
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
  reporter,
  reporterAny,
  reporterConfig,
  runner,
  runnerAny,
  runnerConfig,
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
]
/* eslint-enable max-lines */
