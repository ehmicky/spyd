import { extname } from 'path'

// When the task file is in TypeScript, automatically use `ts-node/register`
export const handleTypeScript = function(requireOpt, taskPath) {
  if (!shouldUseTsNode(requireOpt, taskPath)) {
    return
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(TS_NODE)
  } catch (error) {
    throw new Error(
      `When the task file is in TypeScript either:
  - 'ts-node' and 'typescript' must be installed
  - the task file must be transpiled by 'tsc'\n\n${error.message}`,
    )
  }
}

const shouldUseTsNode = function(requireOpt, taskPath) {
  return (
    !requireOpt.some(isTsNode) &&
    TYPESCRIPT_EXTENSIONS.includes(extname(taskPath))
  )
}

// Works not only with 'ts-node/register' but also
// 'ts-node/register/transpile-only', etc.
const isTsNode = function(requiredModule) {
  return requiredModule.startsWith(TS_NODE)
}

const TYPESCRIPT_EXTENSIONS = ['.ts', '.tsx']
const TS_NODE = 'ts-node/register'
