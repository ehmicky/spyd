// Ensure we are using an Error instance
export const normalizeError = function (error) {
  return error instanceof Error ? error : new Error(error)
}
