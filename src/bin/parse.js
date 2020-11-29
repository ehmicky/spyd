import filterObj from 'filter-obj'

import { normalizeArrayProps } from './array.js'
import { normalizeDynamicProps } from './dynamic.js'

export const parseCliFlags = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...config
  } = yargs.parse()

  const configA = normalizeDynamicProps(config)
  const configB = normalizeArrayProps(configA)

  const configC = filterObj(configB, isUserProp)
  return [command, configC]
}

const DEFAULT_COMMAND = 'run'

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
