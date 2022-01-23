import { inspect } from 'util'

import { UserError } from '../../../../error/main.js'
import { wrapError } from '../../../../error/wrap.js'

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
      `Configuration property "runnerConfig.node.require" must be an array of strings: ${inspect(
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
    throw wrapError(
      error,
      `Configuration property "runnerConfig.node.require" with value "${requiredModule}" could not be imported\n\n`,
      UserError,
    )
  }
}
