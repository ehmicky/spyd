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

import {
  checkBoolean,
  checkInteger,
  checkString,
  normalizeOptionalArray,
  checkEmptyArray,
  checkDefinedString,
  checkJson,
  checkObject,
} from './check.js'
// eslint-disable-next-line import/max-dependencies
import { normalizeConfigPath, normalizeConfigGlob } from './path.js'

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

const config = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: getDefaultConfig,
  transform: normalizeOptionalArray,
}

const configAny = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  validate: checkDefinedString,
}

const colors = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate: checkBoolean,
}

const cwd = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: getCwd,
  validate: checkDefinedString,
  transform(value, { name, context: { configInfos } }) {
    return normalizeConfigPath(value, name, configInfos)
  },
}

const delta = {
  condition: amongCommands(['remove', 'show']),
  default: 1,
  transform: transformDelta,
}

const force = {
  condition: amongCommands(['remove']),
  default() {
    return !isTtyInput()
  },
  validate: checkBoolean,
}

const inputs = {
  condition: amongCommands(['dev', 'run']),
  default: {},
  validate: checkObject,
}

const inputsAny = {
  condition: amongCommands(['dev', 'run']),
  validate: checkJson,
}

const limit = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate(value, { name }) {
    recurseConfigSelectors(value, name, checkInteger)
  },
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) =>
      transformLimit(childValue, childName),
    )
  },
}

const merge = {
  condition: amongCommands(['run']),
  default: getDefaultId,
  validate(value) {
    checkDefinedString(value)
    validateMerge(value)
  },
}

const output = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate: checkDefinedString,
  transform(value, { name, context: { configInfos } }) {
    return isOutputPath(value)
      ? normalizeConfigPath(value, name, configInfos)
      : value
  },
}

const outliers = {
  condition: amongCommands(['run']),
  default: false,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const precision = {
  condition: amongCommands(['run']),
  default: 5,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, checkInteger)
  },
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) =>
      transformPrecision(childValue, childName),
    )
  },
}

const quiet = {
  condition: amongCommands(['run']),
  validate: checkBoolean,
}

const reporter = [
  {
    condition: amongCommands(['remove']),
    async transform(value, { get }) {
      return (await get('force')) ? [] : value
    },
  },
  {
    condition: amongCommands(['remove', 'run', 'show']),
    default: ['debug'],
    transform(value) {
      return normalizeOptionalArray(value)
    },
  },
]

const reporterAny = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate: checkDefinedString,
}

const reporterConfig = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: {},
  validate: checkObject,
}

const runner = {
  condition: amongCommands(['dev', 'run']),
  // We default `runner` to `node` only instead of several ones (e.g. `cli`)
  // because this enforces that the `runner` property points to a required tasks
  // file, instead of to an optional one. This makes behavior easier to
  // understand for users and provides with better error messages.
  default: ['node'],
  validate: checkEmptyArray,
  transform: normalizeOptionalArray,
}

const runnerAny = {
  condition: amongCommands(['dev', 'run']),
  validate: checkDefinedString,
}

const runnerConfig = {
  condition: amongCommands(['dev', 'run']),
  default: {},
  validate: checkObject,
}

const save = {
  condition: amongCommands(['run']),
  default: false,
  validate: checkBoolean,
}

const select = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: [],
  transform: normalizeOptionalArray,
}

const selectAny = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  validate: checkString,
}

const showDiff = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showMetadata = {
  condition: amongCommands(['remove', 'run', 'show']),
  default({ context: { command } }) {
    return command !== 'run'
  },
  validate: checkBoolean,
}

const showPrecision = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: false,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showSystem = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate: checkBoolean,
}

const showTitles = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: false,
  validate(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const since = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: 1,
  transform: transformDelta,
}

const system = {
  condition: amongCommands(['dev', 'run']),
  default: {},
  validate: checkObject,
}

const systemAny = {
  condition: amongCommands(['dev', 'run']),
  validate: checkDefinedString,
}

const tasks = {
  condition: amongCommands(['dev', 'run']),
  default: [],
  transform: normalizeOptionalArray,
}

const tasksAny = {
  condition: amongCommands(['dev', 'run']),
  validate: checkDefinedString,
  async transform(value, { name, context: { configInfos } }) {
    return await normalizeConfigGlob(value, name, configInfos)
  },
}

const titles = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: {},
  validate: checkObject,
}

const titlesAny = {
  condition: amongCommands(['remove', 'run', 'show']),
  validate: checkDefinedString,
}

export const DEFINITIONS = {
  colors,
  config,
  'config[*]': configAny,
  cwd,
  delta,
  force,
  inputs,
  'inputs.*': inputsAny,
  limit,
  merge,
  output,
  outliers,
  precision,
  quiet,
  reporter,
  'reporter[*]': reporterAny,
  reporterConfig,
  runner,
  'runner[*]': runnerAny,
  runnerConfig,
  save,
  select,
  'select[*]': selectAny,
  showDiff,
  showMetadata,
  showPrecision,
  showSystem,
  showTitles,
  since,
  system,
  'system.*': systemAny,
  tasks,
  'tasks[*]': tasksAny,
  titles,
  'titles.*': titlesAny,
}
/* eslint-enable max-lines */
