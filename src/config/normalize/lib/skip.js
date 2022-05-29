export const shouldSkipKeyword = function (definition, input, undefinedInput) {
  return definition === undefined || shouldSkipInput(input, undefinedInput)
}

const shouldSkipInput = function (input, undefinedInput) {
  return (
    (undefinedInput === false && input === undefined) ||
    (undefinedInput === null && input !== undefined)
  )
}

export const shouldSkipMain = function (definition, undefinedDefinition) {
  return definition === undefined && !undefinedDefinition
}
