import { handleTypeScript } from './typescript.js'

// Use the `require` option
export const useRequireOpt = async function (requireOpt, taskPath) {
  const requireOptA = normalizeRequireOpt(requireOpt)

  await handleTypeScript(requireOptA, taskPath)

  await Promise.all(requireOptA.map(useRequiredModule))
}

const normalizeRequireOpt = function (requireOpt = []) {
  if (typeof requireOpt === 'string') {
    return [requireOpt]
  }

  validateRequireOpt(requireOpt)

  return requireOpt
}

const validateRequireOpt = function (requireOpt) {
  if (!Array.isArray(requireOpt) || !requireOpt.every(isString)) {
    throw new TypeError(
      `'node.require' option must be an array of strings: ${requireOpt}`,
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
    throw new Error(
      `Could not load 'node.require' option '${requiredModule}'\n\n${error.stack}`,
    )
  }
}
