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
  checkArrayLength,
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
  async default() {
    return await getDefaultConfig()
  },
  transform(value) {
    return normalizeOptionalArray(value)
  },
}

const configAny = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  transform: checkDefinedString,
}

const colors = {
  condition: amongCommands(['remove', 'run', 'show']),
  transform: checkBoolean,
}

const cwd = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default() {
    return getCwd()
  },
  transform(value, { name, context: { configInfos } }) {
    checkDefinedString(value)
    return normalizeConfigPath(value, name, configInfos)
  },
}

const delta = {
  condition: amongCommands(['remove', 'show']),
  default: 1,
  transform(value, { name }) {
    return transformDelta(value, name)
  },
}

const force = {
  condition: amongCommands(['remove']),
  default() {
    return !isTtyInput()
  },
  transform: checkBoolean,
}

const inputs = {
  condition: amongCommands(['dev', 'run']),
  default: {},
  transform: checkObject,
}

const inputsAny = {
  condition: amongCommands(['dev', 'run']),
  transform: checkJson,
}

const limit = {
  condition: amongCommands(['remove', 'run', 'show']),
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) => {
      checkInteger(childValue)
      return transformLimit(childValue, childName)
    })
  },
}

const merge = {
  condition: amongCommands(['run']),
  default() {
    return getDefaultId()
  },
  transform(value, { name }) {
    checkDefinedString(value)
    validateMerge(value, name)
  },
}

const output = {
  condition: amongCommands(['remove', 'run', 'show']),
  transform(value, { name, context: { configInfos } }) {
    checkDefinedString(value)
    return isOutputPath(value)
      ? normalizeConfigPath(value, name, configInfos)
      : value
  },
}

const outliers = {
  condition: amongCommands(['run']),
  default: false,
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const precision = {
  condition: amongCommands(['run']),
  default: 5,
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) => {
      checkInteger(childValue)
      return transformPrecision(childValue, childName)
    })
  },
}

const quiet = {
  condition: amongCommands(['run']),
  transform: checkBoolean,
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
  transform: checkDefinedString,
}

const reporterConfig = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: {},
  transform: checkObject,
}

const runner = {
  condition: amongCommands(['dev', 'run']),
  // We default `runner` to `node` only instead of several ones (e.g. `cli`)
  // because this enforces that the `runner` property points to a required tasks
  // file, instead of to an optional one. This makes behavior easier to
  // understand for users and provides with better error messages.
  default: ['node'],
  transform(value) {
    const valueA = normalizeOptionalArray(value)
    checkArrayLength(valueA)
    return valueA
  },
}

const runnerAny = {
  condition: amongCommands(['dev', 'run']),
  transform: checkDefinedString,
}

const runnerConfig = {
  condition: amongCommands(['dev', 'run']),
  default: {},
  transform: checkObject,
}

const save = {
  condition: amongCommands(['run']),
  default: false,
  transform: checkBoolean,
}

const select = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  default: [],
  transform(value) {
    return normalizeOptionalArray(value)
  },
}

const selectAny = {
  condition: amongCommands(['dev', 'remove', 'run', 'show']),
  transform: checkString,
}

const showDiff = {
  condition: amongCommands(['remove', 'run', 'show']),
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showMetadata = {
  condition: amongCommands(['remove', 'run', 'show']),
  default({ context: { command } }) {
    return command !== 'run'
  },
  transform: checkBoolean,
}

const showPrecision = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: false,
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showSystem = {
  condition: amongCommands(['remove', 'run', 'show']),
  transform: checkBoolean,
}

const showTitles = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: false,
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const since = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: 1,
  transform(value, { name }) {
    return transformDelta(value, name)
  },
}

const system = {
  condition: amongCommands(['dev', 'run']),
  default: {},
  transform: checkObject,
}

const systemAny = {
  condition: amongCommands(['dev', 'run']),
  transform: checkDefinedString,
}

const tasks = {
  condition: amongCommands(['dev', 'run']),
  default: [],
  transform(value) {
    return normalizeOptionalArray(value)
  },
}

const tasksAny = {
  condition: amongCommands(['dev', 'run']),
  async transform(value, { name, context: { configInfos } }) {
    checkDefinedString(value)
    return await normalizeConfigGlob(value, name, configInfos)
  },
}

const titles = {
  condition: amongCommands(['remove', 'run', 'show']),
  default: {},
  transform: checkObject,
}

const titlesAny = {
  condition: amongCommands(['remove', 'run', 'show']),
  transform: checkDefinedString,
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
