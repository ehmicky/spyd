import { readFile } from 'fs/promises'
import { extname } from 'path'

import { load as loadYaml, JSON_SCHEMA } from 'js-yaml'

import { wrapError } from '../error/wrap.js'

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
  } catch (error) {
    throw wrapError(error, `Could not read file '${path}'\n`)
  }
}

const parseYaml = function (string, path) {
  try {
    return loadYaml(string, { schema: JSON_SCHEMA })
  } catch (error) {
    throw wrapError(error, `Invalid YAML in file '${path}'\n`)
  }
}
