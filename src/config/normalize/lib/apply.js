import { applyKeywords } from './keywords/main.js'

// Apply a rule on a specific property
export const applyRule = async function ({
  rule,
  input,
  config,
  moves,
  warnings,
  opts,
}) {
  return await applyKeywords({ rule, input, config, moves, warnings, opts })
}
