import isPlainObj from 'is-plain-obj'

// `--report.json` and `--report.json.name` are normalized to
// `{ report: { json: { name } } }`.
// Same thing for `--progress`, `--run` and `--store`
export const normalizeDynamicProps = function (configFlags) {
  const dynamicProps = DYNAMIC_CONFIG_PROPS.map((name) =>
    normalizeDynamicProp(name, configFlags),
  )
  const dynamicPropsA = Object.fromEntries(dynamicProps)
  return { ...configFlags, ...dynamicPropsA }
}

const DYNAMIC_CONFIG_PROPS = ['report', 'progress', 'run', 'store']

const normalizeDynamicProp = function (name, configFlags) {
  const value = configFlags[name]

  if (!isPlainObj(value)) {
    return [name, value]
  }

  const valueA = Object.entries(value).map(normalizeProp)
  const valueB = Object.fromEntries(valueA)
  return [name, valueB]
}

// `value` will be an array when specifying `--report.*` several times
const normalizeProp = function ([name, value]) {
  if (!Array.isArray(value)) {
    return [name, normalizeValue(value)]
  }

  const valueA = Object.assign({}, ...value.map(normalizeValue))
  return [name, valueA]
}

// `value` will be `true` when specifying `--report.REPORTER` (as opposed to
// `--report.REPORTER.NAME`
const normalizeValue = function (value) {
  if (value === true) {
    return {}
  }

  return value
}
