// Inputs passed to tasks.
// Can be used as variations to add some combination dimensions where the same
// task (logic) vary based on the input (data).
// Values can be any JSON type. When using objects, variations must be used
// to avoid ambiguity.
// This can be converted from/to an object and an array shape.
export const toInputsArr = function (inputs) {
  return Object.entries(inputs).map(getInput)
}

const getInput = function ([inputId, inputValue]) {
  return { inputId, inputValue }
}

export const toInputsObj = function (inputsArr) {
  return Object.assign({}, ...inputsArr.map(getInputPair))
}

const getInputPair = function ({ inputId, inputValue }) {
  return { [inputId]: inputValue }
}

// Retrieve all inputs identifiers
export const getInputIds = function (inputsArr) {
  return inputsArr.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}
