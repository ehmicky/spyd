// Add positive|negative sign depending on stat type
export const addSign = function (pretty, signed, stats) {
  if (signed === undefined) {
    return pretty
  }

  return SIGN_HANDLERS[signed](pretty, stats)
}

const addNeverSign = function (pretty) {
  if (hasMinusSign(pretty)) {
    return `${PLUS_MINUS_SIGN}${pretty.slice(1)}`
  }

  return `${PLUS_MINUS_SIGN}${pretty}`
}

const addDiffSign = function (pretty, { diffPrecise }) {
  const impreciseSign = diffPrecise ? '' : DIFF_IMPRECISE_SIGN

  if (hasMinusSign(pretty)) {
    return `${DIFF_MINUS_SIGN}${impreciseSign}${pretty.slice(1)}`
  }

  return `${DIFF_PLUS_SIGN}${impreciseSign}${pretty}`
}

const hasMinusSign = function (pretty) {
  return pretty.startsWith(MINUS_SIGN)
}

// Works on all terminals
const PLUS_MINUS_SIGN = '±'
const MINUS_SIGN = '-'
const DIFF_MINUS_SIGN = '\u25BC '
const DIFF_PLUS_SIGN = '\u25B2 '
const DIFF_IMPRECISE_SIGN = '\u2248'

const SIGN_HANDLERS = {
  never: addNeverSign,
  diff: addDiffSign,
}
