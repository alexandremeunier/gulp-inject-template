var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var through = require('through2');
var replaceStream = require('replacestream');
var path = require('path');
var fs = require('fs');
var lodashTemplate = require('lodash.template');
var chalk = require('chalk');

var PLUGIN_NAME = 'injectTemplate';

var htmlRequirePattern =  /require\(['"](.*\.html)['"]\)?/gi;

function log(srcfilepath, templatefilepath) {
  gutil.log(
    'Injecting', 
    chalk.cyan(
      path.relative(
        process.cwd(), 
        path.resolve(path.dirname(srcfilepath), templatefilepath)
      )
    ), 
    'into', 
    chalk.green(
      path.relative(process.cwd(), srcfilepath)
    )
  );
}

function replacerPlugin(options) {
  if(typeof options === 'undefined') options = {};

  var stream = through.obj(function(file, enc, cb) {

    if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers are not supported.'));
      return cb();
    }

    var replacer = function(match, templatepath) {
      log(file.path, templatepath);

      var absoluteTemplatepath = path.resolve(path.dirname(file.path), templatepath);
      var template = fs.readFileSync(absoluteTemplatepath, 'utf-8');

      return lodashTemplate(template, options).source;
    };

    file.contents = file.contents
      .pipe(replaceStream(htmlRequirePattern, replacer));

    this.push(file);
    cb();
  });

  return stream;
}

module.exports = replacerPlugin;