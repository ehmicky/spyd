import stringWidth from 'string-width'

// Merge two blocks horizontally
export const concatBlocks = function (rawBlocks) {
  const blocks = rawBlocks.map(splitBlock)
  const length = getBlocksHeight(blocks)
  return Array.from({ length }, (_, index) =>
    getBlocksLine(blocks, index),
  ).join('\n')
}

const splitBlock = function (rawBlock) {
  const lines = rawBlock.split('\n')
  const width = Math.max(...lines.map(stringWidth))
  return { lines, width }
}

const getBlocksHeight = function (blocks) {
  return Math.max(...blocks.map(getBlockHeight))
}

const getBlockHeight = function ({ lines: { length } }) {
  return length
}

const getBlocksLine = function (blocks, index) {
  return blocks.map((block) => getBlockLine(index, block)).join('')
}

const getBlockLine = function (
  index,
  { lines: { [index]: line = '' }, width },
) {
  return line.padEnd(width)
}
