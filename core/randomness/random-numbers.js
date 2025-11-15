function generateRandomNumber(min = 1, max = 1000) {
  return Math.floor(Math.random() * (max - min)) + min;
}
module.exports = generateRandomNumber;
