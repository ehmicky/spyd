// Add positive|negative sign depending on stat type
export const addSign = function (pretty, signed, stats) {
  if (signed === undefined) {
    return pretty
  }

  return SIGN_HANDLERS[signed](pretty, stats)
}

const addNeverSign = function (pretty) {
  return hasMinusSign(pretty)
    ? `${PLUS_MINUS_SIGN}${pretty.slice(1)}`
    : `${PLUS_MINUS_SIGN}${pretty}`
}

const addDiffSign = function (pretty, { diffPrecise }) {
  const impreciseSign = diffPrecise ? '' : IMPRECISE_SIGN

  return hasMinusSign(pretty)
    ? `${impreciseSign}${pretty}`
    : `${impreciseSign}${PLUS_SIGN}${pretty}`
}

const hasMinusSign = function (pretty) {
  return pretty.startsWith(MINUS_SIGN)
}

// Works on all terminals
const PLUS_MINUS_SIGN = '±'
const MINUS_SIGN = '-'
const PLUS_SIGN = '+'
const IMPRECISE_SIGN = '\u2248'

const SIGN_HANDLERS = {
  never: addNeverSign,
  diff: addDiffSign,
}
