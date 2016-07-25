var extend = require('deepmerge');
var fm = require('front-matter');
var path = require('path');
var through = require('through2');
var processRoot = require('./processRoot');

module.exports = function() {
  return through.obj(render.bind(this));
}

/**
 * Renders a page with a layout. The page also has access to any loaded partials, helpers, or data.
 * @param {object} file - Vinyl file being parsed.
 * @param {string} enc - Vinyl file encoding.
 * @param {function} cb - Callback that passes the rendered page through the stream.
 */
function render(file, enc, cb) {
  try {
    // Get the HTML for the current page and layout
    var page = fm(file.contents.toString());
    var pageData;

    // Determine which layout to use
    var basePath = path.relative(this.options.root, path.dirname(file.path));
    var layout =
      page.attributes.layout ||
      (this.options.pageLayouts && this.options.pageLayouts[basePath]) || this.options.defaultLayout ||
      'default';
    var layoutTemplate = this.layouts[layout];

    if (!layoutTemplate) {
      if (layout === 'default') {
        throw new Error('Panini error: you must have a layout named "default".');
      }
      else {
        throw new Error('Panini error: no layout named "'+layout+'" exists.');
      }
    }

    // Now create Handlebars templates out of them
    var pageTemplate = page.body + '\n';

    // Build page data with globals
    pageData = extend({}, this.data);

    // Add any data from stream plugins
    pageData = (file.data) ? extend(pageData, file.data) : pageData;

    // Add this page's front matter
    pageData = extend(pageData, page.attributes);

    // Finish by adding constants
    pageData = extend(pageData, {
      page: path.basename(file.path, '.html'),
      layout: layout,
      root: processRoot(file.path, this.options.root)
    });

    // Finally, add the page as a partial called "body", and render the layout template
    this.partials['body'] = pageTemplate;
    file.contents = new Buffer(this.Mustache.render(layoutTemplate, pageData, this.partials));
  }
  catch (e) {
    if (layoutTemplate) {
      // Layout was parsed properly so we can insert the error message into the body of the layout
      this.partials['body'] = 'Panini: template could not be parsed <br> \n <pre>{{error}}</pre>';
      file.contents = new Buffer(this.Mustache.render(layoutTemplate, { error: e }, this.partials));
    }
    else {
      // Not even once - write error directly into the HTML output so the user gets an error
      // Maintain basic html structure to allow Livereloading scripts to be injected properly
      file.contents = new Buffer('<!DOCTYPE html><html><head><title>Panini error</title></head><body><pre>'+e+'</pre></body></html>');
    }

    // Log the error into console
    console.log('Panini: rendering error ocurred.\n', e);
  }
  finally {
    // This sends the modified file back into the stream
    cb(null, file);
  }
}
