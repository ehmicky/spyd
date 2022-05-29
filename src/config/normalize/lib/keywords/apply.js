import { callMain } from '../call/main.js'

import { normalizeDefinition } from './definition.js'
import { applyReturnValue } from './return.js'

// Call `keyword.normalize()`, then `keyword.main()` and apply the return value
export const applyKeywordMain = async function ({
  keyword,
  test,
  hasInput,
  exampleDefinition,
  normalize,
  normalizeSync,
  main,
  mainSync,
  input,
  definition,
  info,
  state,
}) {
  const normalizedDefinition = await normalizeDefinition({
    definition,
    normalize,
    normalizeSync,
    info,
    keyword,
    exampleDefinition,
  })
  const returnValue = await callMain({
    main,
    mainSync,
    normalizedDefinition,
    definition,
    input,
    info,
    hasInput,
    test,
    keyword,
  })
  const stateA = applyReturnValue({ returnValue, state })
  return stateA
}
