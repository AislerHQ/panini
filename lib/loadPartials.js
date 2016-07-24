var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');

/**
 * Looks for files with .html or .mustache extensions within the given directory, and adds them as Mustache partials matching the name of the file.
 * @param {string} dir - Folder to check for partials.
 */
module.exports = function(dir) {
  var partials = utils.loadFiles(dir, '**/*.{html,mustache}');

  for (var i in partials) {
    var ext = path.extname(partials[i]);
    var file = fs.readFileSync(partials[i]);
    var name = path.basename(partials[i], ext);
    this.partials[name] = file.toString() + '\n';
  }
}
