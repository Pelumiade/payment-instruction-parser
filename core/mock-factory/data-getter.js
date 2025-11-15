module.exports = function (key = 'default', stubs = {}) {
  let data = stubs[key];
  const keyIsDefault = key === 'default';

  if (!data && !keyIsDefault) {
    data = stubs.default;
  }

  if (!data) throw new Error(`No default or ${key} data stub setup`);

  return data;
};
