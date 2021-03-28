// Add positive|negative sign depending on stat type
export const addSign = function (statPretty, signed) {
  if (signed === undefined) {
    return statPretty
  }

  return SIGN_HANDLERS[signed](statPretty)
}

const addNeverSign = function (statPretty) {
  const statPrettyA = hasMinusSign(statPretty)
    ? statPretty.slice(1)
    : statPretty
  return `${PLUS_MINUS_SIGN}${statPrettyA}`
}

const addAlwaysSign = function (statPretty) {
  if (hasMinusSign(statPretty)) {
    return statPretty
  }

  return `${PLUS_SIGN}${statPretty}`
}

const hasMinusSign = function (statPretty) {
  return statPretty.startsWith(MINUS_SIGN)
}

// Works on all terminals
const PLUS_MINUS_SIGN = '±'
const PLUS_SIGN = '+'
const MINUS_SIGN = '-'

const SIGN_HANDLERS = {
  never: addNeverSign,
  always: addAlwaysSign,
}
