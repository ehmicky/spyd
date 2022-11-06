import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

import { load as loadYaml, JSON_SCHEMA } from 'js-yaml'

import { UnknownError } from '../error/main.js'

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
    throw new UnknownError(`File extension must be ".yml" or ".yaml": ${path}`)
  }
}

const YAML_FILE_EXTENSIONS = new Set(['.yml', '.yaml'])

const readYamlFile = async function (path) {
  try {
    return await readFile(path, 'utf8')
  } catch (cause) {
    throw new UnknownError(`Could not read file '${path}'.`, { cause })
  }
}

const parseYaml = function (string, path) {
  try {
    return loadYaml(string, { schema: JSON_SCHEMA })
  } catch (cause) {
    throw new UnknownError(`Invalid YAML in file '${path}'.`, { cause })
  }
}
