/* eslint-disable max-lines */
import { cwd as getCwd } from 'process'

import { normalizeLimit } from '../../history/compare/normalize.js'
import { normalizeDelta } from '../../history/delta/normalize.js'
import { getDefaultId, validateMerge } from '../../history/merge/id.js'
import { isOutputPath } from '../../report/output.js'
import { isTtyInput } from '../../report/tty.js'
import { normalizePrecision } from '../../run/precision.js'
import { getDefaultConfig } from '../load/default.js'
import { recurseConfigSelectors } from '../select/normalize.js'

import {
  checkBoolean,
  checkInteger,
  checkString,
  normalizeOptionalArray,
  checkArrayItems,
  checkArrayLength,
  checkObjectProps,
  checkDefinedString,
  checkJson,
} from './check.js'
// eslint-disable-next-line import/max-dependencies
import { normalizeConfigPath, normalizeConfigGlob } from './path.js'

const config = {
  async default() {
    return await getDefaultConfig()
  },
  normalize(value, { name }) {
    const valueA = normalizeOptionalArray(value)
    checkArrayItems(valueA, name, checkDefinedString)
    return valueA
  },
}

const colors = {
  normalize(value, { name }) {
    checkBoolean(value, name)
  },
}

const cwd = {
  default() {
    return getCwd()
  },
  normalize(value, { name, configInfos }) {
    checkDefinedString(value, name)
    return normalizeConfigPath(value, name, configInfos)
  },
}

const delta = {
  default: 1,
  normalize(value, { name }) {
    return normalizeDelta(value, name)
  },
}

const force = {
  default() {
    return !isTtyInput()
  },
  normalize(value, { name }) {
    checkBoolean(value, name)
  },
}

const inputs = {
  default: {},
  normalize(value, { name }) {
    checkObjectProps(value, name, checkJson)
  },
}

const limit = {
  normalize(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) => {
      checkInteger(childValue, childName)
      return normalizeLimit(childValue, childName)
    })
  },
}

const merge = {
  default() {
    return getDefaultId()
  },
  normalize(value, { name }) {
    checkDefinedString(value, name)
    validateMerge(value, name)
  },
}

const output = {
  normalize(value, { name, configInfos }) {
    checkDefinedString(value, name)
    return isOutputPath(value)
      ? normalizeConfigPath(value, name, configInfos)
      : value
  },
}

const outliers = {
  default: false,
  normalize(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const precision = {
  default: 5,
  normalize(value, { name }) {
    return recurseConfigSelectors(value, name, (childValue, childName) => {
      checkInteger(childValue, childName)
      return normalizePrecision(childValue, childName)
    })
  },
}

const quiet = {
  normalize(value, { name }) {
    checkBoolean(value, name)
  },
}

const reporter = {
  default: ['debug'],
  normalize(value) {
    return normalizeOptionalArray(value)
  },
}

// `reporter` configuration property specific logic for the `remove` command
const reporterRemove = {
  ...reporter,
  async normalize(value, { name, get }) {
    const forceValue = await get('force')
    return forceValue ? [] : reporter.normalize(value, { name })
  },
}

const reporterAny = {
  normalize(value, { name }) {
    checkDefinedString(value, name)
  },
}

const reporterConfig = {
  default: {},
}

const runner = {
  // We default `runner` to `node` only instead of several ones (e.g. `cli`)
  // because this enforces that the `runner` property points to a required tasks
  // file, instead of to an optional one. This makes behavior easier to
  // understand for users and provides with better error messages.
  default: ['node'],
  normalize(value, { name }) {
    const valueA = normalizeOptionalArray(value)
    checkArrayLength(valueA, name)
    return valueA
  },
}

const runnerAny = {
  normalize(value, { name }) {
    checkDefinedString(value, name)
  },
}

const runnerConfig = {
  default: {},
}

const save = {
  default: false,
  normalize(value, { name }) {
    checkBoolean(value, name)
  },
}

const select = {
  default: [],
  normalize(value) {
    return normalizeOptionalArray(value)
  },
}

const selectAny = {
  normalize(value, { name }) {
    checkString(value, name)
  },
}

const showDiff = {
  normalize(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showMetadata = {
  default: true,
  normalize(value, { name }) {
    checkBoolean(value, name)
  },
}

// `showMetadata` configuration property specific logic for the `run` command
const showMetadataRun = {
  ...showMetadata,
  default: false,
}

const showPrecision = {
  default: false,
  normalize(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const showSystem = {
  normalize(value, { name }) {
    checkBoolean(value, name)
  },
}

const showTitles = {
  default: false,
  normalize(value, { name }) {
    recurseConfigSelectors(value, name, checkBoolean)
  },
}

const since = {
  default: 1,
  normalize(value, { name }) {
    return normalizeDelta(value, name)
  },
}

const system = {
  default: {},
}

const systemAny = {
  normalize(value, { name }) {
    checkDefinedString(value, name)
  },
}

const tasks = {
  normalize(value) {
    return normalizeOptionalArray(value)
  },
}

const tasksAny = {
  async normalize(value, { name, configInfos }) {
    checkDefinedString(value, name)
    return await normalizeConfigGlob(value, name, configInfos)
  },
}

const titles = {
  default: {},
}

const titlesAny = {
  normalize(value, { name }) {
    checkDefinedString(value, name)
  },
}

// All config properties can be specified in `spyd.yml` (unlike CLI flags), for
// any commands.
// Therefore, we need to filter them out depending on the current command.
export const COMMANDS_PROPS = {
  dev: {
    config,
    cwd,
    inputs,
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
    cwd,
    delta,
    force,
    limit,
    output,
    reporter: reporterRemove,
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
    cwd,
    inputs,
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
    showMetadata: showMetadataRun,
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
