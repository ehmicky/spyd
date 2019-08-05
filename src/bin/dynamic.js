import { isPlainObject } from '../utils/main.js'

// `--report.json` and `--report.json.option` are normalized to
// `{ report: { json: { option } } }`
export const normalizeDynamicOpts = function(opt) {
  if (!isPlainObject(opt)) {
    return opt
  }

  const optA = Object.entries(opt).map(normalizeDynamicOpt)
  return Object.fromEntries(optA)
}

// `value` will be an array when specifying `--report.*` several times
const normalizeDynamicOpt = function([name, value]) {
  if (!Array.isArray(value)) {
    return [name, normalizeDynamic(value)]
  }

  const valueA = Object.assign({}, ...value.map(normalizeDynamic))
  return [name, valueA]
}

// `value` will be `true` when specifying `--report.REPORTER` (as opposed to
// `--report.REPORTER.OPT`
const normalizeDynamic = function(value) {
  if (value === true) {
    return {}
  }

  return value
}
