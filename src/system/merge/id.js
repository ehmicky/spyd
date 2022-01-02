// Retrieve `mergeId` for validation.
// The mergeId is an opaque identifier.
// However, we do validate it is not empty and only has restricted characters,
// especially since it is used in filenames.
// In order to inject values to, shell variables or JavaScript configuration
// files can be used.
export const getMergeIdsArray = function ({ merge }) {
  return merge === undefined ? [] : [merge]
}

// Retrieve `mergeId` to set as result property
export const getMergeIdProp = function ({ merge }) {
  return merge === undefined ? {} : { mergeId: merge }
}
