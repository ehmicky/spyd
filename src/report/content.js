import { insertContent } from './insert.js'
import { print } from './print.js'

// Handle content using the `output` and `insert` options
export const handleContent = async function (content, { output, insert }) {
  if (!hasContent(content)) {
    return
  }

  await Promise.all([print(content, output), insertContent(content, insert)])
}

const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
