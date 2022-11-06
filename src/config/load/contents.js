import { extname } from 'node:path'
import { inspect } from 'node:util'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../../error/main.js'
import { importJsDefault } from '../../utils/import.js'
import { loadYamlFile } from '../../utils/yaml.js'

// Load and parse `spyd.*` file contents
export const loadConfigContents = async function (configPath) {
  const loadFunc = EXTENSIONS[extname(configPath)]

  if (loadFunc === undefined) {
    throw new UserError(
      'File format is not supported. Please use .yml, .js, .mjs or .cjs',
    )
  }

  const configContents = await loadContents(loadFunc, configPath)

  if (!isPlainObj(configContents)) {
    throw new UserError(
      `File must be a plain object, not: ${inspect(configContents)}`,
    )
  }

  return configContents
}

const loadContents = async function (loadFunc, configPath) {
  try {
    return await loadFunc(configPath)
  } catch (cause) {
    throw new UserError('File cannot be loaded.', { cause })
  }
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
// We allow JavaScript files for dynamic configs such as:
//  - Using environment variables (including checking if is CI) or platform test
//  - Computing a long list of inputs
// On the CLI, shell features such as subshells and variable expansion can also
// be used for dynamic configs.
// We use YAML instead of JSON to:
//  - Allow comments
//  - Enforce consistency with `cli` runner's `tasks.yml`
// Order is significant
const EXTENSIONS = {
  '.js': importJsDefault,
  '.mjs': importJsDefault,
  '.cjs': importJsDefault,
  '.yml': loadYamlFile,
  '.yaml': loadYamlFile,
}

// Return filenames looked up by the default value of the `config` flag
const getConfigFilenames = function () {
  const configFilenames = Object.keys(EXTENSIONS).map(
    (extName) => `${DEFAULT_CONFIG_BASENAME}${extName}`,
  )
  return new Set(configFilenames)
}

const DEFAULT_CONFIG_BASENAME = 'spyd'

export const CONFIG_FILENAMES = getConfigFilenames()
