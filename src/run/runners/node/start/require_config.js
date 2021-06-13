import { inspect } from 'util'

import { UserError } from '../../../../error/main.js'

// Use the `require` config
export const useRequireConfig = async function (requireConfig) {
  const requireConfigA = normalizeRequireConfig(requireConfig)
  await Promise.all(requireConfigA.map(useRequiredModule))
}

const normalizeRequireConfig = function (requireConfig = []) {
  if (typeof requireConfig === 'string') {
    return [requireConfig]
  }

  if (!Array.isArray(requireConfig) || !requireConfig.every(isString)) {
    throw new UserError(
      `'runnerNode.require' configuration property must be an array of strings: ${inspect(
        requireConfig,
      )}`,
    )
  }

  return requireConfig
}

const isString = function (value) {
  return typeof value === 'string'
}

const useRequiredModule = async function (requiredModule) {
  try {
    await import(requiredModule)
  } catch (error) {
    throw new UserError(
      `Could not require 'runnerNode.require' configuration property '${requiredModule}'\n\n${error.stack}`,
    )
  }
}
