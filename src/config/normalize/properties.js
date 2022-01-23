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

const config = {
  async default() {
    return await getDefaultConfig()
  },
  transform(value) {
    return normalizeOptionalArray(value)
  },
}

const configAny = {
  transform(value, { name }) {
    checkDefinedString(value, name)
  },
}

const colors = {
  transform(value, { name }) {
    checkBoolean(value, name)
  },
}

const cwd = {
  default() {
    return getCwd()
  },
  transform(value, { name, context: { configInfos } }) {
    checkDefinedString(value, name)
    return normalizeConfigPath(value, name, configInfos)
  },
}

const delta = {
  default: 1,
  transform(value, { name }) {
    return transformDelta(value, name)
  },
}

const force = {
  default() {
    return !isTtyInput()
  },
  transform(value, { name }) {
    checkBoolean(value, name)
  },
}

const inputs = {
  default: {},
  transform(value, { name }) {
    checkObject(value, name)
  },
}

const inputsAny = {
  transform(value, { name }) {
    checkJson(value, name)
  },
}

const limit = {
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) => {
      checkInteger(childValue, childName)
      return transformLimit(childValue, childName)
    })
  },
}

const merge = {
  default() {
    return getDefaultId()
  },
  transform(value, { name }) {
    checkDefinedString(value, name)
    validateMerge(value, name)
  },
}

const output = {
  transform(value, { name, context: { configInfos } }) {
    checkDefinedString(value, name)
    return isOutputPath(value)
      ? normalizeConfigPath(value, name, configInfos)
      : value
  },
}

const outliers = {
  default: false,
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const precision = {
  default: 5,
  transform(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) => {
      checkInteger(childValue, childName)
      return transformPrecision(childValue, childName)
    })
  },
}

const quiet = {
  transform(value, { name }) {
    checkBoolean(value, name)
  },
}

const reporter = [
  {
    condition(value, { context: { command } }) {
      return command === 'remove'
    },
    async transform(value, { get }) {
      return (await get('force')) ? [] : value
    },
  },
  {
    default: ['debug'],
    transform(value) {
      return normalizeOptionalArray(value)
    },
  },
]

const reporterAny = {
  transform(value, { name }) {
    checkDefinedString(value, name)
  },
}

const reporterConfig = {
  default: {},
  transform(value, { name }) {
    checkObject(value, name)
  },
}

const runner = {
  // We default `runner` to `node` only instead of several ones (e.g. `cli`)
  // because this enforces that the `runner` property points to a required tasks
  // file, instead of to an optional one. This makes behavior easier to
  // understand for users and provides with better error messages.
  default: ['node'],
  transform(value, { name }) {
    const valueA = normalizeOptionalArray(value)
    checkArrayLength(valueA, name)
    return valueA
  },
}

const runnerAny = {
  transform(value, { name }) {
    checkDefinedString(value, name)
  },
}

const runnerConfig = {
  default: {},
  transform(value, { name }) {
    checkObject(value, name)
  },
}

const save = {
  default: false,
  transform(value, { name }) {
    checkBoolean(value, name)
  },
}

const select = {
  default: [],
  transform(value) {
    return normalizeOptionalArray(value)
  },
}

const selectAny = {
  transform(value, { name }) {
    checkString(value, name)
  },
}

const showDiff = {
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showMetadata = [
  {
    condition(value, { context: { command } }) {
      return command === 'run'
    },
    default: false,
  },
  {
    default: true,
    transform(value, { name }) {
      checkBoolean(value, name)
    },
  },
]

const showPrecision = {
  default: false,
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showSystem = {
  transform(value, { name }) {
    checkBoolean(value, name)
  },
}

const showTitles = {
  default: false,
  transform(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const since = {
  default: 1,
  transform(value, { name }) {
    return transformDelta(value, name)
  },
}

const system = {
  default: {},
  transform(value, { name }) {
    checkObject(value, name)
  },
}

const systemAny = {
  transform(value, { name }) {
    checkDefinedString(value, name)
  },
}

const tasks = {
  default: [],
  transform(value) {
    return normalizeOptionalArray(value)
  },
}

const tasksAny = {
  async transform(value, { name, context: { configInfos } }) {
    checkDefinedString(value, name)
    return await normalizeConfigGlob(value, name, configInfos)
  },
}

const titles = {
  default: {},
  transform(value, { name }) {
    checkObject(value, name)
  },
}

const titlesAny = {
  transform(value, { name }) {
    checkDefinedString(value, name)
  },
}

// All config properties can be specified in `spyd.yml` (unlike CLI flags), for
// any commands.
// Therefore, we need to filter them out depending on the current command.
export const COMMANDS_PROPS = {
  dev: {
    config,
    'config[*]': configAny,
    cwd,
    inputs,
    'inputs.*': inputsAny,
    runner,
    'runner[*]': runnerAny,
    runnerConfig,
    select,
    'select[*]': selectAny,
    system,
    'system.*': systemAny,
    tasks,
    'tasks[*]': tasksAny,
  },
  remove: {
    colors,
    config,
    'config[*]': configAny,
    cwd,
    delta,
    force,
    limit,
    output,
    reporter,
    'reporter[*]': reporterAny,
    reporterConfig,
    select,
    'select[*]': selectAny,
    showDiff,
    showMetadata,
    showPrecision,
    showSystem,
    showTitles,
    since,
    titles,
    'titles.*': titlesAny,
  },
  run: {
    colors,
    config,
    'config[*]': configAny,
    cwd,
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
  },
  show: {
    colors,
    config,
    'config[*]': configAny,
    cwd,
    delta,
    limit,
    output,
    reporter,
    'reporter[*]': reporterAny,
    reporterConfig,
    select,
    'select[*]': selectAny,
    showDiff,
    showMetadata,
    showPrecision,
    showSystem,
    showTitles,
    since,
    titles,
    'titles.*': titlesAny,
  },
}
/* eslint-enable max-lines */
