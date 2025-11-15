function multiLineCommentProcessor(line) {
  const nodeInfo = {};
  const trimmedLine = line.trim();
  if (trimmedLine.startsWith('/*')) {
    nodeInfo.isMultiLineCommentOpening = true;
    nodeInfo.isCommentBlock = true;
    nodeInfo.isCommentNode = true;
    nodeInfo.isOpened = true;
    nodeInfo.lineMatched = true;
  } else if (trimmedLine.startsWith('*/')) {
    nodeInfo.isClosed = true;
    nodeInfo.isCommentNode = true;
    nodeInfo.isMultiLineCommentClosing = true;
    nodeInfo.lineMatched = true;
  }
  return nodeInfo;
}
module.exports = multiLineCommentProcessor;
