function commentBlockLineProcessor(line) {
  return {
    lineMatched: true,
    isCommentNode: true,
  };
}
module.exports = commentBlockLineProcessor;
