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
  padding: true,
}
