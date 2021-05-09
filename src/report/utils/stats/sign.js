// Add positive|negative sign depending on stat type
export const addSign = function (pretty, signed) {
  if (signed === undefined) {
    return pretty
  }

  return SIGN_HANDLERS[signed](pretty)
}

const addNeverSign = function (pretty) {
  const prettyA = hasMinusSign(pretty) ? pretty.slice(1) : pretty
  return `${PLUS_MINUS_SIGN}${prettyA}`
}

const addDiffSign = function (pretty) {
  if (hasMinusSign(pretty)) {
    return pretty
  }

  return `${PLUS_SIGN}${pretty}`
}

const hasMinusSign = function (pretty) {
  return pretty.startsWith(MINUS_SIGN)
}

// Works on all terminals
const PLUS_MINUS_SIGN = '±'
const PLUS_SIGN = '+'
const MINUS_SIGN = '-'

const SIGN_HANDLERS = {
  never: addNeverSign,
  diff: addDiffSign,
}
