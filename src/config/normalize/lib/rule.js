import { normalizeQuery, serializeQuery } from 'wild-wild-parser'
import { get } from 'wild-wild-path'

import { wrapError } from '../../../error/wrap.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules) {
  return rules.map(normalizeRule)
}

const normalizeRule = function ({
  name,
  pick,
  condition,
  default: defaultValue,
  compute,
  path,
  glob = false,
  required = defaultRequired,
  example = defaultValue,
  schema,
  validate,
  warn,
  transform,
  rename,
}) {
  const namePath = getNamePath(name)
  const nameQuery = serializeQuery(namePath)
  return {
    nameQuery,
    namePath,
    pick,
    condition,
    default: defaultValue,
    compute,
    path,
    glob,
    required,
    example,
    schema,
    validate,
    warn,
    transform,
    rename,
  }
}

// `required` defaults to `false` except for array items.
// This validates against sparse arrays by default, since they are usually
// unwanted.
const defaultRequired = function ({ path, config }) {
  return path.length !== 0 && Array.isArray(get(config, path.slice(0, -1)))
}

const getNamePath = function (name) {
  try {
    return normalizeQuery(name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":')
  }
}
