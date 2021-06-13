import { extname } from 'path'

import { UserError } from '../error/main.js'

export const importJsFile = async function (filePath) {
  const importFunc = EXTENSIONS[extname(filePath)]

  if (importFunc === undefined) {
    throw new UserError(`Invalid file extension: ${filePath}`)
  }

  return await importFunc(filePath)
}

// We support importing both CommonJS and ES modules.
// CommonJS are imported as `default` imports when using `import()`.
const importJavaScript = async function (configPath) {
  const importedValue = await import(configPath)
  return 'default' in importedValue ? importedValue.default : importedValue
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
