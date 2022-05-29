import { applyKeywords } from './keywords/main.js'

export const validateAndModify = async function ({
  input,
  config,
  moves,
  warnings,
  opts,
  ...rule
}) {
  return await applyKeywords({ rule, input, config, moves, warnings, opts })
}
