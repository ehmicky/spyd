import { cleanObject } from '../utils/clean.js'

// `output`, `insert`, `colors`, `showDiff`, `showSystem`, `showMetadata`
// can be set either for specific reporter (--reporter{id}.output) or for
// all (--output)
export const handleReportConfig = function (
  reportConfig,
  { output, insert, colors, showDiff, showSystem, showMetadata },
) {
  return cleanObject({
    output,
    insert,
    colors,
    showDiff,
    showSystem,
    showMetadata,
    ...reportConfig,
  })
}
