import { print } from './print.js'
import { insertContent } from './insert.js'

// Handle content using the `output` and `insert` options
export const handleContent = async function({
  content,
  reportOpt: { output, insert },
}) {
  if (!hasContent(content)) {
    return
  }

  await Promise.all([
    print({ content, output, insert }),
    insertContent({ content, insert }),
  ])
}

const hasContent = function(content) {
  return typeof content === 'string' && content.trim() !== ''
}
