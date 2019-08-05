import { handleTypeScript } from './typescript.js'

// Use the `require` option
export const useRequireOpt = function(requireOpt, taskPath) {
  handleTypeScript(requireOpt, taskPath)

  requireOpt.forEach(useRequiredModule)
}

const useRequiredModule = function(requiredModule) {
  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(requiredModule)
  } catch (error) {
    throw new Error(
      `Could not load 'require' option '${requiredModule}'\n\n${error.stack}`,
    )
  }
}
