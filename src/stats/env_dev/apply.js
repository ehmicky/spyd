// When taking `envDev` into account, it is sometimes too low:
//  - When benchmark ended too early, `stdev` or `envDev` tends to be too low
//  - `envDev` tends to be lower than real value in general with the current
//    algorithm
// In some cases, `envDev` is too much of a problem, so we multiply it.
export const applyImpreciseEnvDev = function (
  loops,
  envDev,
  envDevImprecision,
) {
  const adjustedEnvDev = (envDev - 1) * envDevImprecision + 1
  return applyEnvDev(loops, adjustedEnvDev)
}

export const applyEnvDev = function (length, envDev) {
  return length / envDev ** 2
}
