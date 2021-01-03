import { env } from 'process'

import { set } from 'dot-prop'

// All the config can be set using environment variables.
// For example `SPYD_DURATION=1` becomes { duration: 1 }
// This is especially useful in CI.
export const getEnvVarConfig = function () {
  return Object.entries(env).filter(isSpydEnvVar).reduce(setEnvVar, {})
}

const isSpydEnvVar = function ([key]) {
  return key.toLowerCase().startsWith(SPYD_NAMESPACE)
}

const setEnvVar = function (envVarConfig, [key, string]) {
  const name = key
    .toLowerCase()
    .replace(SPYD_NAMESPACE, '')
    .replace(SPYD_DELIMITER_REGEXP, '.')
  const value = transtypeString(string)
  return set(envVarConfig, name, value)
}

const SPYD_NAMESPACE = 'spyd_'
const SPYD_DELIMITER_REGEXP = /_/gu

// Allow any JSON type
const transtypeString = function (string) {
  try {
    return JSON.parse(string)
  } catch {
    return string
  }
}
