// Inputs passed to tasks.
// Can be used as variations to add some combination dimensions where the same
// task (logic) varies based on the input (data).
// Values can be any JSON type. When using objects, variations must be used
// to avoid ambiguity.
// This can be converted from/to an object and an array shape.
export const toInputsList = (inputs) => Object.entries(inputs).map(getInput)

const getInput = ([inputId, inputValue]) => ({ inputId, inputValue })

export const toInputsObject = (inputsList) =>
  Object.assign({}, ...inputsList.map(getInputPair))

const getInputPair = ({ inputId, inputValue }) => ({ [inputId]: inputValue })

// Retrieve all inputs identifiers
export const getInputIds = (inputsList) => inputsList.map(getInputId)

const getInputId = ({ inputId }) => inputId

export const DEFAULT_INPUTS = {}
export const EXAMPLE_INPUTS = { inputNameOne: 1, inputNameTwo: 2 }
export const EXAMPLE_INPUT_VALUE = 'inputValue'
