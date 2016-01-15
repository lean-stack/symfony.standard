
// For better performance place the vendor libs into a seperate file
var $         = require('jquery');
window.jQuery = $; // Export to global context for bootstrap
var Tether    = require('tether');
window.Tether = Tether; // Export to global context for bootstrap v4-alpha
var bootstrap = require('bootstrap');
