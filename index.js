var panini;

/**
 * Initializes an instance of Panini.
 * @constructor
 * @param {object} options - Configuration options to use.
 */
function PaniniMustache(options) {
  this.options = options;
  this.Mustache = require('mustache');
  this.layouts = {};
  this.partials = {};
  this.data = {};

  if (!options.layouts) {
    throw new Error('Panini error: you must specify a directory for layouts.');
  }

  if (!options.root) {
    throw new Error('Panini error: you must specify the root folder that pages live in.')
  }
}

PaniniMustache.prototype.refresh = require('./lib/refresh');
PaniniMustache.prototype.loadLayouts = require('./lib/loadLayouts');
PaniniMustache.prototype.loadPartials = require('./lib/loadPartials');
PaniniMustache.prototype.loadData = require('./lib/loadData');
PaniniMustache.prototype.render = require('./lib/render');

/**
 * Gulp stream function that renders HTML pages. The first time the function is invoked in the stream, a new instance of Panini is created with the given options.
 * @param {object} options - Configuration options to pass to the new Panini instance.
 * @returns {function} Transform stream function that renders HTML pages.
 */
module.exports = function(options) {
  if (!panini) {
    panini = new PaniniMustache(options);
    panini.refresh();
    module.exports.refresh = panini.refresh.bind(panini);
  }

  // Compile pages with the above helpers
  return panini.render();
}

module.exports.PaniniMustache = PaniniMustache;
module.exports.refresh = function() {}
