import { extname } from 'path'

import { UserError } from '../error/main.js'

export const importJsFile = async function (filePath) {
  const importfunc = EXTENSIONS[extname(filePath)]

  if (importfunc === undefined) {
    throw new UserError(`Invalid file extension: ${filePath}`)
  }

  return await importfunc(filePath)
}

const importJavaScript = async function (configPath) {
  return await import(configPath)
}

const importTypeScript = async function (configPath) {
  try {
    await import(TS_NODE)
  } catch (error) {
    throw new UserError(
      `Using *.ts requires 'typescript' to be installed and configured.
${error.message}`,
    )
  }

  return await import(configPath)
}

const TS_NODE = 'ts-node/esm'

const EXTENSIONS = {
  '.js': importJavaScript,
  '.cjs': importJavaScript,
  '.mjs': importJavaScript,
  '.ts': importTypeScript,
}
