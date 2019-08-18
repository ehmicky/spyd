import { constructor as Chalk } from 'chalk'

// Pass `chalk` to reporters. Is noop if `colors` option is `false`.
// We also pass `colors` in case reporters cannot use Chalk (e.g. not CLI).
export const getChalk = function({ colors, ...reportOpt }) {
  const chalk = new Chalk({ enabled: colors })
  return { ...reportOpt, colors, chalk }
}
