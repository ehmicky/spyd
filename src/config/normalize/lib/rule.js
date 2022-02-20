import { get } from './prop_path/get.js'

// Validate and normalize rules
export const normalizeRule = function (
  {
    name,
    pick,
    condition,
    default: defaultValue,
    compute,
    path = false,
    glob = false,
    required = defaultRequired,
    example,
    validate,
    transform,
    rename,
  },
  index,
  rules,
) {
  const exampleA = addDefaultExample(example, name, rules)
  return {
    name,
    pick,
    condition,
    default: defaultValue,
    compute,
    path,
    glob,
    required,
    example: exampleA,
    validate,
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

// `rule.example` only needs to be defined once per `rule.name`,
// defaulting to the first value from other rules.
// It can also default to any `rule.default`.
const addDefaultExample = function (example, name, rules) {
  if (example !== undefined) {
    return example
  }

  const ruleA = rules.find(
    (rule) => rule.name === name && rule.example !== undefined,
  )

  if (ruleA !== undefined) {
    return ruleA.example
  }

  const ruleB = rules.find(
    (rule) => rule.name === name && rule.default !== undefined,
  )
  return ruleB === undefined ? undefined : useDefaultAsExample(ruleB.default)
}

const useDefaultAsExample = function (defaultValue) {
  return typeof defaultValue === 'function'
    ? (value, opts) => defaultValue(opts)
    : defaultValue
}
