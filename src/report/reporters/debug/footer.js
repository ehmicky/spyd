import { blue, dim, underline } from 'chalk'
import indentString from 'indent-string'

// Retrieve footer: system, timestamp, group, link
export const getFooter = function ({
  timestampPretty,
  systemsPretty,
  gitPretty,
  ciPretty,
  commandsPretty,
  group,
}) {
  const footers = [
    systemsPretty,
    commandsPretty,
    gitPretty,
    ciPretty,
    addPrefix('Timestamp', timestampPretty),
    addPrefix('Group', group),
    LINK_FOOTER,
  ].filter(Boolean)

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

const addPrefix = function (name, value) {
  if (value === undefined) {
    return
  }

  return `${blue.bold(`${name}:`)} ${value}`
}

const LINK_FOOTER = dim(
  `Benchmarked with spyd (${underline('https://github.com/ehmicky/spyd')})`,
)

const indentFooter = function (footer) {
  return indentString(footer, 1)
}
