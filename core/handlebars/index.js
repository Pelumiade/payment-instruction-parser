// Handlebars UTILS
const parse = require('./parse');
const render = require('./render');

module.exports = {
  parse,
  render,
};

// const templateString = `{{name}} of {{things}}`;
// console.log(render(parse(templateString), {name:'Joh', things:'Coil'}));
