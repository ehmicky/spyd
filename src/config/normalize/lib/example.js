// `rule.example` only needs to be defined once per `rule.name`,
// defaulting to the first value from other rules.
// It can also default to any `rule.default`.
export const addDefaultExample = function (example, nameQuery, rules) {
  if (example !== undefined) {
    return example
  }

  const ruleA = rules.find(
    (rule) => rule.nameQuery === nameQuery && rule.example !== undefined,
  )

  if (ruleA !== undefined) {
    return ruleA.example
  }

  const ruleB = rules.find(
    (rule) => rule.nameQuery === nameQuery && rule.default !== undefined,
  )
  return ruleB === undefined ? undefined : useDefaultAsExample(ruleB.default)
}

const useDefaultAsExample = function (defaultValue) {
  return typeof defaultValue === 'function'
    ? (value, opts) => defaultValue(opts)
    : defaultValue
}
