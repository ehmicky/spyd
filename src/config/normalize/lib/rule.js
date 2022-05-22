import { normalizeQuery, serializeQuery } from 'wild-wild-parser'
import { get } from 'wild-wild-path'

import { wrapError } from '../../../error/wrap.js'

import { addDefaultExample } from './example.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules) {
  return rules.map(parseName).map(normalizeRule)
}

const parseName = function ({ name, ...rule }) {
  const namePath = getNamePath(name)
  const nameQuery = serializeQuery(namePath)
  return { ...rule, namePath, nameQuery }
}

const getNamePath = function (name) {
  try {
    return normalizeQuery(name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":')
  }
}

const normalizeRule = function (
  {
    nameQuery,
    namePath,
    pick,
    condition,
    default: defaultValue,
    compute,
    path = false,
    glob = false,
    required = defaultRequired,
    example,
    schema,
    validate,
    warn,
    transform,
    rename,
  },
  index,
  rules,
) {
  const exampleA = addDefaultExample(example, nameQuery, rules)
  const validateA = normalizeOptionalArray(validate)
  const warnA = normalizeOptionalArray(warn)
  const transformA = normalizeOptionalArray(transform)
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
    example: exampleA,
    schema,
    validate: validateA,
    warn: warnA,
    transform: transformA,
    rename,
  }
}

// For convenience, some rule methods which are functions can be array of
// functions too.
// We do not do this on functions returning booleans since it would be ambiguous
// whether they should use a union or an intersection.
const normalizeOptionalArray = function (value) {
  return value === undefined || Array.isArray(value) ? value : [value]
}

// `required` defaults to `false` except for array items.
// This validates against sparse arrays by default, since they are usually
// unwanted.
const defaultRequired = function ({ path, config }) {
  return path.length !== 0 && Array.isArray(get(config, path.slice(0, -1)))
}
