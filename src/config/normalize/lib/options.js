import isPlainObj from 'is-plain-obj'

export const normalizeOpts = function (rules, { soft = false, all } = {}) {
  validateRules(rules)
  return { soft, all }
}

const validateRules = function (rules) {
  if (!Array.isArray(rules)) {
    throw new TypeError(`Rules must be an array: ${rules}`)
  }

  rules.forEach(validateRule)
}

const validateRule = function (rule) {
  if (!isPlainObj(rule)) {
    throw new TypeError(`Rules must be plain objects: ${rule}`)
  }
}
