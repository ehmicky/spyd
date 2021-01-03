// Inputs passed to tasks.
// Can be used as property sets to add dimensions where the same task (logic)
// vary based on the input (data).
// Values can be any JSON type. When using objects, property sets must be used
// to avoid ambiguity.
export const getInputs = function (input) {
  return Object.entries(input).map(getInput)
}

const getInput = function ([inputName, inputValue]) {
  return { inputName, inputValue }
}
