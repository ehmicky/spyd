import isPlainObj from 'is-plain-obj'

// `--report.json` and `--report.json.option` are normalized to
// `{ report: { json: { option } } }`.
// Same thing for `--progress`, `--run` and `--store`
export const normalizeDynamicOpts = function(opts) {
  const dynamicOpts = DYNAMIC_OPTS.map(name => normalizeDynamicOpt(name, opts))
  const dynamicOptsA = Object.fromEntries(dynamicOpts)
  return { ...opts, ...dynamicOptsA }
}

const DYNAMIC_OPTS = ['report', 'progress', 'run', 'store']

const normalizeDynamicOpt = function(name, opts) {
  const opt = opts[name]

  if (!isPlainObj(opt)) {
    return [name, opt]
  }

  const optA = Object.entries(opt).map(normalizeOpt)
  const optB = Object.fromEntries(optA)
  return [name, optB]
}

// `value` will be an array when specifying `--report.*` several times
const normalizeOpt = function([name, value]) {
  if (!Array.isArray(value)) {
    return [name, normalizeValue(value)]
  }

  const valueA = Object.assign({}, ...value.map(normalizeValue))
  return [name, valueA]
}

// `value` will be `true` when specifying `--report.REPORTER` (as opposed to
// `--report.REPORTER.OPT`
const normalizeValue = function(value) {
  if (value === true) {
    return {}
  }

  return value
}
