import { extname } from 'path'

import { UserError } from '../../../../error/main.js'

// When the tasks file is in TypeScript, automatically use `ts-node/register`
export const handleTypeScript = async function (requireConfig, taskPath) {
  if (!shouldUseTsNode(requireConfig, taskPath)) {
    return
  }

  try {
    await import(TS_NODE)
  } catch (error) {
    throw new UserError(
      `When the tasks file is in TypeScript either:
  - 'ts-node' and 'typescript' must be installed
  - the tasks file must be transpiled by 'tsc'

${error.message}`,
    )
  }
}

const shouldUseTsNode = function (requireConfig, taskPath) {
  return (
    !requireConfig.some(isTsNode) &&
    TYPESCRIPT_EXTENSIONS.has(extname(taskPath))
  )
}

// Works not only with 'ts-node/register' but also
// 'ts-node/register/transpile-only', etc.
const isTsNode = function (requiredModule) {
  return requiredModule.startsWith(TS_NODE)
}

const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx'])
const TS_NODE = 'ts-node/register'
