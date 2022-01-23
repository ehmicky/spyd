import { promises as fs } from 'fs'

import { load as loadYaml, JSON_SCHEMA } from 'js-yaml'

import { wrapError } from '../error/wrap.js'

// Load and parse YAML file
export const loadYamlFile = async function (path) {
  const string = await readYamlFile(path)
  const content = parseYaml(string, path)
  return content
}

const readYamlFile = async function (path) {
  try {
    return await fs.readFile(path, 'utf8')
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
