import { extname } from 'path'

// When the benchmark file is in TypeScript, automatically use
// `ts-node/register`
export const handleTypeScript = async function(requireOpt, taskPath) {
  if (!shouldUseTsNode(requireOpt, taskPath)) {
    return
  }

  try {
    await import(TS_NODE)
  } catch (error) {
    throw new Error(
      `When the benchmark file is in TypeScript either:
  - 'ts-node' and 'typescript' must be installed
  - the benchmark file must be transpiled by 'tsc'\n\n${error.message}`,
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
