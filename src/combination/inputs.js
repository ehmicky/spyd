// Inputs passed to tasks.
// Can be used as variations to add some combination dimensions where the same
// task (logic) varies based on the input (data).
// Values can be any JSON type. When using objects, variations must be used
// to avoid ambiguity.
// This can be converted from/to an object and an array shape.
export const toInputsList = function (inputs) {
  return Object.entries(inputs).map(getInput)
}

const getInput = function ([inputId, inputValue]) {
  return { inputId, inputValue }
}

export const toInputsObject = function (inputsList) {
  return Object.assign({}, ...inputsList.map(getInputPair))
}

const getInputPair = function ({ inputId, inputValue }) {
  return { [inputId]: inputValue }
}

// Retrieve all inputs identifiers
export const getInputIds = function (inputsList) {
  return inputsList.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}

export const DEFAULT_INPUTS = {}
