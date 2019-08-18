import { constructor as Chalk } from 'chalk'
import stripAnsi from 'strip-ansi'

// Pass `chalk` to reporters. Is noop if `colors` option is `false`.
// We also pass `colors` in case reporters cannot use Chalk (e.g. not CLI).
export const getChalk = function({ colors, ...reportOpt }) {
  const chalk = new Chalk({ enabled: colors })
  return { ...reportOpt, colors, chalk }
}

// Strip colors from reporters output if `colors` option is false
export const handleColors = function(output, { colors }) {
  if (colors) {
    return output
  }

  return stripAnsi(output)
}
