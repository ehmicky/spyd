// Add positive|negative sign depending on stat type
export const addSign = function (pretty, signed) {
  if (signed === undefined) {
    return pretty
  }

  return SIGN_HANDLERS[signed](pretty)
}

const addNeverSign = function (pretty) {
  if (hasMinusSign(pretty)) {
    return `${PLUS_MINUS_SIGN}${pretty.slice(1)}`
  }

  return `${PLUS_MINUS_SIGN}${pretty}`
}

const addDiffSign = function (pretty) {
  if (hasMinusSign(pretty)) {
    return `${DIFF_MINUS_SIGN}${pretty.slice(1)}`
  }

  return `${DIFF_PLUS_SIGN}${pretty}`
}

const hasMinusSign = function (pretty) {
  return pretty.startsWith(MINUS_SIGN)
}

// Works on all terminals
const PLUS_MINUS_SIGN = '±'
const MINUS_SIGN = '-'
const DIFF_MINUS_SIGN = '\u25BC '
const DIFF_PLUS_SIGN = '\u25B2 '

const SIGN_HANDLERS = {
  never: addNeverSign,
  diff: addDiffSign,
}
