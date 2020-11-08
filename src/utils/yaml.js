import { promises as fs } from 'fs'

import { load as loadYaml, JSON_SCHEMA } from 'js-yaml'

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
    throw new Error(`Could not read file '${path}'\n\n${error.stack}`)
  }
}

const parseYaml = function (string, path) {
  try {
    return loadYaml(string, { schema: JSON_SCHEMA })
  } catch (error) {
    throw new Error(`Invalid YAML in file '${path}'\n\n${error.stack}`)
  }
}
