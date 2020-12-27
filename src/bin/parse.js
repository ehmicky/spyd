import filterObj from 'filter-obj'

import { normalizeDynamicProps } from './dynamic.js'

export const parseCliFlags = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...config
  } = yargs.parse()

  const configA = normalizeDynamicProps(config)

  const configB = filterObj(configA, isUserProp)
  return { command, config: configB }
}

const DEFAULT_COMMAND = 'bench'

// Remove `yargs`-specific properties, shortcuts and dash-cased
const isUserProp = function (key, value) {
  return (
    value !== undefined &&
    !INTERNAL_KEYS.has(key) &&
    key.length !== 1 &&
    !key.includes('-')
  )
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])
