const ulid = require('./ulid');
const uuid = require('./uuid');
const rbyt = require('./random-bytes');
const rnum = require('./random-numbers');

console.log(ulid());
console.log(uuid());
console.log(rbyt(2));
console.log(rbyt(7));
console.log(rbyt(8));
console.log(rnum(1000, 9999));
console.log(rnum(1000, 9999));
console.log(rnum(1000, 9999));
console.log(rnum(1000, 9999));
console.log(rnum(10, 999));
