import process from 'process'

import { addPadding } from '../report/utils/indent.js'

// Print CLI errors and exit, depending on the error type
// TODO: error normalization?
// TODO: enforce error types for bugs inside the CLI logic?
export const handleCliError = function (error) {
  const { exitCode, printStack, indented } = ERROR_PROPS[error.name]
  const errorMessage = printStack ? error.stack : error.message
  const errorMessageA = indented ? addPadding(errorMessage) : errorMessage
  console.error(errorMessageA)
  process.exitCode = exitCode
}

// Error type-specific behavior
const ERROR_PROPS = {
  CoreError: { exitCode: 5, printStack: true, indented: false },
  PluginError: { exitCode: 4, printStack: true, indented: false },
  UserCodeError: { exitCode: 3, printStack: true, indented: false },
  UserError: { exitCode: 2, printStack: false, indented: false },
  LimitError: { exitCode: 1, printStack: false, indented: false },
  StopError: { exitCode: 0, printStack: false, indented: true },
}
