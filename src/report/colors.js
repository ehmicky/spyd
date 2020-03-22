import stripAnsi from 'strip-ansi'

// Strip colors from reporters output if `colors` option is false
export const handleColors = function (output, { colors }) {
  if (colors) {
    return output
  }

  return stripAnsi(output)
}
