import { readFile } from 'fs/promises'
import { extname } from 'path'

import { load as loadYaml, JSON_SCHEMA } from 'js-yaml'

// Load and parse YAML file
export const loadYamlFile = async function (path) {
  validateFileExtension(path)
  const string = await readYamlFile(path)
  const content = parseYaml(string, path)
  return content
}

// Prevent against selecting the wrong file
const validateFileExtension = function (path) {
  if (!YAML_FILE_EXTENSIONS.has(extname(path))) {
    throw new Error(`File extension must be ".yml" or ".yaml": ${path}`)
  }
}

const YAML_FILE_EXTENSIONS = new Set(['.yml', '.yaml'])

const readYamlFile = async function (path) {
  try {
    return await readFile(path, 'utf8')
  } catch (cause) {
    throw new Error(`Could not read file '${path}'.`, { cause })
  }
}

const parseYaml = function (string, path) {
  try {
    return loadYaml(string, { schema: JSON_SCHEMA })
  } catch (cause) {
    throw new Error(`Invalid YAML in file '${path}'.`, { cause })
  }
}
