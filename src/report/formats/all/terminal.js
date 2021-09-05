import { getLineSeparator } from '../../utils/line.js'
import { prettifyValue } from '../../utils/prettify_value.js'

// Format meant for string output which should be output to a terminal or to
// a file.
// Used as the fallback format.
export const TERMINAL_FORMAT = {
  name: 'terminal',
  detect() {
    return true
  },
  methods: ['reportTerminal'],
  async report({ reportTerminal }, reporterArgs) {
    return await reportTerminal(...reporterArgs)
  },
  concat: true,
  footer(footer) {
    return `\n${getLineSeparator()}\n${prettifyValue(footer)}\n`
  },
  padding: true,
}
