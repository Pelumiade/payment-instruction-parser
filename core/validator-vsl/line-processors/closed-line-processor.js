function isClosedLineProcessor(line = '') {
  let nodeInfo = {};
  if (line.trim().replace(/\s/g, '') === '}') {
    nodeInfo = {
      lineMatched: true,
      isClosed: true,
    };
  }
  return nodeInfo;
}
module.exports = isClosedLineProcessor;
