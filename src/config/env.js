import { env } from 'process'

// All the config can be set using environment variables.
// For example `SPYD_DURATION=1` becomes { duration: 1 }
// This is especially useful in CI.
export const getEnvVarConfig = function () {
  return Object.assign(
    {},
    ...Object.entries(env).filter(isSpydEnvVar).map(getEnvVar),
  )
}

const isSpydEnvVar = function ([key]) {
  return key.toLowerCase().startsWith(SPYD_NAMESPACE)
}

const getEnvVar = function ([key, string]) {
  const name = key.toLowerCase().replace(SPYD_NAMESPACE, '')
  const value = transtypeString(string)
  return { [name]: value }
}

const SPYD_NAMESPACE = 'spyd_'

// Allow any JSON type
const transtypeString = function (string) {
  try {
    return JSON.parse(string)
  } catch {
    return string
  }
}
