// When merging a new result, the timestamp of the group is updated.
// This is what most users would expect.
// We implement this by sorting metadataGroups by timestamp, and only
// considering the timestamp of the most recent result.
export const findByTime = function (metadataGroups, timestamp) {
  return metadataGroups.findIndex(
    (metadata) => metadata[metadata.length - 1].timestamp >= timestamp,
  )
}
