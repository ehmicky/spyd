// Inputs passed to tasks.
// Can be used as variations to add some combination categories where the same
// task (logic) vary based on the input (data).
// Values can be any JSON type. When using objects, variations must be used
// to avoid ambiguity.
export const fromInputsObj = function (inputsObj) {
  return Object.entries(inputsObj).map(getInput)
}

const getInput = function ([inputId, inputValue]) {
  return { inputId, inputValue }
}

export const toInputsObj = function (inputs) {
  return Object.assign({}, ...inputs.map(getInputPair))
}

const getInputPair = function ({ inputId, inputValue }) {
  return { [inputId]: inputValue }
}

export const getInputIds = function (inputs) {
  return inputs.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}
