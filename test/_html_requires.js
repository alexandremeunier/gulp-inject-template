// Test file with normal js require calls
var module1 = require('./index.js');
var module2 = require('./module2');
var template1 = require("./_template1.html")
var template2 = require('./_template2.html');
console.log(module1, module2, template1, template2);