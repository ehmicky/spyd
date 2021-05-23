// We cannot validate against unknown flags since some of them have dynamic
// names, e.g. `--runner{Runner}` or `--reporter{Reporter}`.
// However, since yargs keeps aliases of known flags when expanding them, we
// remove aliases after flags parsing.
// In order not to remove unknown aliases, so they can be validated, we need to
// keep a list of them.
export const ALIASES = new Set(['c', 'f', 'l', 'o', 'p', 'q', 'r', 's'])
