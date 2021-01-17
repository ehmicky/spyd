// Inputs passed to tasks.
// Can be used as variations to add some combination categories where the same
// task (logic) vary based on the input (data).
// Values can be any JSON type. When using objects, variations must be used
// to avoid ambiguity.
export const getInputs = function (inputs) {
  return Object.entries(inputs).map(getInput)
}

const getInput = function ([inputId, inputValue]) {
  return { inputId, inputValue }
}

export const getInputIds = function (inputs) {
  return inputs.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}
