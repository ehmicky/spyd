import { UserError } from '../../../../error/main.js'

import { handleTypeScript } from './typescript.js'

// Use the `require` config
export const useRequireConfig = async function (requireConfig, taskPath) {
  const requireConfigA = normalizeRequireConfig(requireConfig)

  await handleTypeScript(requireConfigA, taskPath)

  await Promise.all(requireConfigA.map(useRequiredModule))
}

const normalizeRequireConfig = function (requireConfig = []) {
  if (typeof requireConfig === 'string') {
    return [requireConfig]
  }

  validateRequireConfig(requireConfig)

  return requireConfig
}

const validateRequireConfig = function (requireConfig) {
  if (!Array.isArray(requireConfig) || !requireConfig.every(isString)) {
    throw new UserError(
      `'run-node-require' configuration property must be an array of strings: ${requireConfig}`,
    )
  }
}

const isString = function (value) {
  return typeof value === 'string'
}

const useRequiredModule = async function (requiredModule) {
  try {
    await import(requiredModule)
  } catch (error) {
    throw new UserError(
      `Could not load 'node.require' option '${requiredModule}'\n\n${error.stack}`,
    )
  }
}
