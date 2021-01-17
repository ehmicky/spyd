import { stderr } from 'process'

import isInteractive from 'is-interactive'
import stripAnsi from 'strip-ansi'

// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
// Interactive output/terminal have different default values for some report
// config properties, so we compute two different contents: interactive and
// non-interactive.
export const getContents = function ({ link, colors }, content) {
  const nonInteractiveContent = getNonInteractiveContent({
    content,
    link,
    colors,
  })
  const interactiveContent = getInteractiveContent({ content, link, colors })
  return { interactiveContent, nonInteractiveContent }
}

const getNonInteractiveContent = function ({
  content,
  link = true,
  colors = false,
}) {
  return normalizeContent({ content, link, colors })
}

const getInteractiveContent = function ({
  content,
  link = false,
  colors = isInteractive(stderr),
}) {
  return normalizeContent({ content, link, colors })
}

// Reporters should always assume `link` and `colors` are true, but the core
// remove those from the returned content if not.
const normalizeContent = function ({ content, link, colors }) {
  const contentA = handleColors(content, colors)
  const contentB = removeLink(contentA, link)
  const contentC = trimContent(contentB)
  return contentC
}

// Strip colors from reporters output if `colors` config property is false
const handleColors = function (content, colors) {
  if (colors) {
    return content
  }

  return stripAnsi(content)
}

// Remove link if `link` config property is false
const removeLink = function (content, link) {
  if (link) {
    return content
  }

  return content.split(UNIX_NEWLINE).filter(hasNoLink).join(UNIX_NEWLINE)
}

const UNIX_NEWLINE = '\n'

const hasNoLink = function (line) {
  return !line.includes(LINK)
}

const LINK = 'ehmicky/spyd'

// Ensure that exactly one newline is before and after the content
const trimContent = function (content) {
  const contentA = content.replace(NEWLINE_REGEXP, '')
  return `${contentA}\n`
}

const NEWLINE_REGEXP = /(^\n*)|(\n*$)/gu
