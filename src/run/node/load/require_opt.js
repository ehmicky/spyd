import { handleTypeScript } from './typescript.js'

// Use the `require` option
export const useRequireOpt = function(requireOpt, taskPath) {
  const requireOptA = normalizeRequireOpt(requireOpt)

  handleTypeScript(requireOptA, taskPath)

  requireOptA.forEach(useRequiredModule)
}

const normalizeRequireOpt = function(requireOpt = []) {
  if (typeof requireOpt === 'string') {
    return [requireOpt]
  }

  validateRequireOpt(requireOpt)

  return requireOpt
}

const validateRequireOpt = function(requireOpt) {
  if (!Array.isArray(requireOpt) || !requireOpt.every(isString)) {
    throw new TypeError(
      `'node.require' option must be an array of strings: ${requireOpt}`,
    )
  }
}

const isString = function(value) {
  return typeof value === 'string'
}

const useRequiredModule = function(requiredModule) {
  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(requiredModule)
  } catch (error) {
    throw new Error(
      `Could not load 'node.require' option '${requiredModule}'\n\n${error.stack}`,
    )
  }
}
