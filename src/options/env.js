import { env } from 'process'

import yn from 'yn'

import { set } from '../utils/get_set.js'

// All the options can be set using environment variables.
// This is especially handy in CI, including for the `group` and `system`
// options.
export const addEnvVars = function(opts) {
  const envVars = Object.entries(env)
    .filter(isSpydEnvVar)
    .map(getEnvVar)
  return Object.assign({}, opts, ...envVars)
}

const isSpydEnvVar = function([key]) {
  return key.startsWith(SPYD_NAMESPACE)
}

const getEnvVar = function([key, value]) {
  const keyA = key.replace(SPYD_NAMESPACE, '').toLowerCase()

  if (keyA.includes('_')) {
    return set({}, keyA.split('_'), value)
  }

  const type = OPTS[keyA]

  if (type === undefined) {
    return {}
  }

  const valueA = TYPES[type](value)
  return { [keyA]: valueA }
}

const SPYD_NAMESPACE = 'SPYD_'

const getBoolean = function(value) {
  return yn(value, { default: true })
}

const getString = function(value) {
  return value
}

const getStringArray = function(value) {
  return [value]
}

const TYPES = {
  boolean: getBoolean,
  string: getString,
  number: Number,
  stringArray: getStringArray,
}

const OPTS = {
  colors: 'boolean',
  config: 'string',
  context: 'boolean',
  cwd: 'string',
  delta: 'string',
  diff: 'boolean',
  duration: 'number',
  files: 'stringArray',
  group: 'string',
  info: 'boolean',
  insert: 'string',
  limit: 'stringArray',
  link: 'boolean',
  output: 'string',
  progress: 'object',
  report: 'object',
  run: 'object',
  save: 'boolean',
  store: 'object',
  system: 'string',
  tasks: 'stringArray',
  variations: 'stringArray',
}
