import { extname } from 'node:path'
import { pathToFileURL } from 'node:url'

import { UserError } from '../error/main.js'

// Import named exports.
// We support importing both CommonJS and ES modules.
// CommonJS are imported as `default` imports when using `import()`.
// ES modules named imports are not plain objects, but module objects.
// We convert them to plain objects.
export const importJsNamed = async function (filePath) {
  const importedValue = await importJsFile(filePath)
  return 'default' in importedValue
    ? importedValue.default
    : { ...importedValue }
}

// Import default exports.
export const importJsDefault = async function (filePath) {
  const importedValue = await importJsFile(filePath)

  if (!('default' in importedValue)) {
    throw new UserError(`Should use a default export instead of named exports`)
  }

  return importedValue.default
}

const importJsFile = async function (filePath) {
  const importFunc = EXTENSIONS[extname(filePath)]

  if (importFunc === undefined) {
    throw new UserError(`Invalid file extension: ${filePath}`)
  }

  return await importFunc(filePath)
}

const importJavaScript = async function (filePath) {
  // eslint-disable-next-line import/no-dynamic-require
  return await import(pathToFileURL(filePath))
}

const EXTENSIONS = {
  '.js': importJavaScript,
  '.cjs': importJavaScript,
  '.mjs': importJavaScript,
}
