import { blue, dim, underline } from 'chalk'
import indentString from 'indent-string'

// Retrieve footer: system, timestamp, group, link
export const getFooter = function({
  timestampPretty,
  systemPretty,
  group,
  info,
  show,
  link,
}) {
  const systemFooter = getSystem(systemPretty, info)
  const timestampFooter = getTimestamp(timestampPretty, show)
  const groupFooter = getGroup(group, show)
  const linkFooter = getLink(link)
  const footers = [
    systemFooter,
    timestampFooter,
    groupFooter,
    linkFooter,
  ].filter(Boolean)

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

const getSystem = function(systemPretty, info) {
  if (!info) {
    return
  }

  return systemPretty
}

const getTimestamp = function(timestampPretty, show) {
  if (!show) {
    return
  }

  return `${blue.bold('Timestamp:')} ${timestampPretty}`
}

const getGroup = function(group, show) {
  if (!show) {
    return
  }

  return `${blue.bold('Group:')} ${group}`
}

const getLink = function(link) {
  if (!link) {
    return
  }

  return dim(
    `Benchmarked with spyd ${underline('(https://github.com/ehmicky/spyd)')}`,
  )
}

const indentFooter = function(footer) {
  return indentString(footer, 1)
}
