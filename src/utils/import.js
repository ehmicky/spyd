import { extname } from 'path'

import { UserError } from '../error/main.js'

// TODO: After dropping support for Node 10, we can add support for ES modules:
//  - import() should be used instead of require(), and should not be transpiled
//    to require() by Babel
//  - *.mjs can be added using same logic as *.cjs|js, i.e. only calling
//    import()
//  - importing *.cjs|mjs|js would return `{ default: object }` not `object`
//  - ts-node/esm should be used instead of ts-node/require
export const importJsDefault = function (filePath) {
  const contents = importJsFile(filePath)
  return contents.default === undefined ? contents : contents.default
}

export const importJsFile = function (filePath) {
  const loadFunc = EXTENSIONS[extname(filePath)]

  if (loadFunc === undefined) {
    throw new UserError(`Invalid file extension: ${filePath}`)
  }

  return loadFunc(filePath)
}

const loadJsFile = function (configPath) {
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  return require(configPath)
}

const loadTsFile = function (configPath) {
  try {
    // eslint-disable-next-line node/global-require, import/no-dynamic-require
    require(TS_NODE)
  } catch (error) {
    throw new UserError(
      `Using *.ts requires 'typescript' to be installed and configured.
${error.message}`,
    )
  }

  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  return require(configPath)
}

const TS_NODE = 'ts-node/register'

const EXTENSIONS = {
  '.js': loadJsFile,
  '.cjs': loadJsFile,
  '.ts': loadTsFile,
}
