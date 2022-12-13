// Add positive|negative sign depending on stat type
export const addSign = (pretty, signed, stats) =>
  signed === undefined ? pretty : SIGN_HANDLERS[signed](pretty, stats)

const addNeverSign = (pretty) =>
  hasMinusSign(pretty)
    ? `${PLUS_MINUS_SIGN}${pretty.slice(1)}`
    : `${PLUS_MINUS_SIGN}${pretty}`

const addDiffSign = (pretty, { diffPrecise, diffLimit }) => {
  const impreciseSign = diffPrecise ? '' : IMPRECISE_SIGN
  const limitSign = diffLimit === undefined ? '' : ' \u203C'

  return hasMinusSign(pretty)
    ? `${impreciseSign}${pretty}${limitSign}`
    : `${impreciseSign}${PLUS_SIGN}${pretty}${limitSign}`
}

const hasMinusSign = (pretty) => pretty.startsWith(MINUS_SIGN)

// Works on all terminals
const PLUS_MINUS_SIGN = '±'
const MINUS_SIGN = '-'
const PLUS_SIGN = '+'
const IMPRECISE_SIGN = '\u2248'

const SIGN_HANDLERS = {
  never: addNeverSign,
  diff: addDiffSign,
}
