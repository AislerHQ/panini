var path = require('path');

/**
 * Initializes a Panini instance by setting up layouts. If partials or data were configured, those are set up as well. If layout, partial or data files ever change, this method can be called again to update the Mustache instance.
 */
module.exports = function() {
  this.loadLayouts(this.options.layouts);
  this.loadPartials(this.options.partials || '!*');
  this.loadData(this.options.data || '!*');
}
