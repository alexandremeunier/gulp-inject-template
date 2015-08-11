// Test file with normal js require calls
var module1 = require('./index.js');
var module2 = require('./module2');
var template1 = function(data) {
var __t, __p = '';
__p += 'Template 1 without variables';
return __p
}
var template2 = function(data) {
var __t, __p = '';
__p += '<h1>template2</h1>\nWith variable: ' +
((__t = ( data )) == null ? '' : __t);
return __p
};
console.log(module1, module2, template1, template2);