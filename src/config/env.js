import { env } from 'process'

import { set } from 'dot-prop'

// All the config can be set using environment variables.
// This is especially handy in CI, including for the `merge` and `system`
// configuration properties.
export const addEnvVars = function (config) {
  return Object.entries(env).filter(isSpydEnvVar).reduce(addEnvVar, config)
}

const isSpydEnvVar = function ([key]) {
  return key.toLowerCase().startsWith(SPYD_NAMESPACE)
}

const addEnvVar = function (config, [key, string]) {
  const name = key
    .toLowerCase()
    .replace(SPYD_NAMESPACE, '')
    .replace(DELIMITER_REGEXP, '.')
  const value = transtypeString(string)
  return set(config, name, value)
}

const DELIMITER = '__'
const DELIMITER_REGEXP = /__/gu
const SPYD_NAMESPACE = `spyd${DELIMITER}`

const transtypeString = function (string) {
  try {
    return JSON.parse(string)
  } catch {
    return string
  }
}
