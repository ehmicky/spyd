import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

import { JSON_SCHEMA, load as loadYaml } from 'js-yaml'

import { UnknownError } from '../error/main.js'

// Load and parse YAML file
export const loadYamlFile = async (path) => {
  validateFileExtension(path)
  const string = await readYamlFile(path)
  const content = parseYaml(string, path)
  return content
}

// Prevent against selecting the wrong file
const validateFileExtension = (path) => {
  if (!YAML_FILE_EXTENSIONS.has(extname(path))) {
    throw new UnknownError(`File extension must be ".yml" or ".yaml": ${path}`)
  }
}

const YAML_FILE_EXTENSIONS = new Set(['.yml', '.yaml'])

const readYamlFile = async (path) => {
  try {
    return await readFile(path, 'utf8')
  } catch (cause) {
    throw new UnknownError(`Could not read file '${path}'.`, { cause })
  }
}

const parseYaml = (string, path) => {
  try {
    return loadYaml(string, { schema: JSON_SCHEMA })
  } catch (cause) {
    throw new UnknownError(`Invalid YAML in file '${path}'.`, { cause })
  }
}
