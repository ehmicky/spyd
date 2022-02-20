// When in `loose` mode, user errors are returned instead of being thrown.
// System errors are always propagated.
export const handleError = function (error, loose) {
  if (!loose || !error.validation) {
    throw error
  }
}
