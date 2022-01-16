import { runNormalizer } from '../utils/functional.js'

import { CONFIG_PROPS } from './properties.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return Object.entries(CONFIG_PROPS).reduce(
    (configA, [name, configProp]) =>
      normalizePropConfig(
        { config: configA, name, configInfos: configInfosA },
        configProp,
      ),
    config,
  )
}

const normalizePropConfig = function (
  { config, name, configInfos },
  { normalize },
) {
  const value = config[name]

  if (value === undefined) {
    return config
  }

  const newValue =
    normalize === undefined
      ? value
      : runNormalizer(normalize, value, name, configInfos)
  return { ...config, [name]: newValue }
}
