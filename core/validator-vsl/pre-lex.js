function preLexInput(input) {
  const finalOutput = [];
  const inputTokens = input.split('\n');
  while (inputTokens.length) {
    const line = inputTokens.shift();
    if (line.trim().startsWith('import ')) {
      const [_, importFile] = line.split(' ');
      const fileContent = require('fs').readFileSync(`./${importFile}`, {
        encoding: 'utf-8',
      });
      /// console.log(fileContent, preLexInput(fileContent));
      finalOutput.push(preLexInput(fileContent));
    } else {
      finalOutput.push(line);
    }
  }
  return finalOutput.join('\n');
}
module.exports = preLexInput;
