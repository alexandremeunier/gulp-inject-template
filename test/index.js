/* eslint-env jasmine */
/* eslint handle-callback-err:0 */
var File = require('vinyl');  
var injectTemplate = require('../');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var readContent = function(file) {
  return fs.readFileSync(file, 'utf-8').trim();
};

var splitContent = function(content) {
  return content.split(/\n/).map(function(line) {
    return line + "\n";
  });
};

var streamingTestFactory = function(options) {
  var done = options.done;
  var path_ = path.resolve(__dirname, options.path) || __filename;

  var expectedOutputPath = options.expectedOutputPath ? 
    path.resolve(__dirname, options.expectedOutputPath) : 
    path_;
  var base = options.base || path.dirname(path_);

  var contents = readContent(path_);
  var expectedOutput = readContent(expectedOutputPath);

  var injectTemplateOptions = options.injectTemplateOptions || {};

  var fakeFile = new File({
    contents: es.readArray(splitContent(contents)),
    base: base,
    path: path_,
    cwd: process.cwd()
  });

  var injector = injectTemplate(injectTemplateOptions);

  injector.write(fakeFile);

  injector.once('data', function(file) {
    expect(file.isStream()).toEqual(true);
    file.contents.pipe(es.wait(function(err, data) {
      expect(data.toString().trim()).toEqual(expectedOutput);
      done(err, data);
    }));
  });
};

describe('gulp-inject-template', function() {
  beforeEach(function() {
    spyOn(gutil, 'log');
  });

  describe('in streaming mode', function() {
    it('should do nothing if there is no require calls', function(done) {
      streamingTestFactory({
        done: done,
        path: './_no_requires.js'
      });
    });

    it('should do nothing if there is are normal js requires', function(done) {
      streamingTestFactory({
        done: done,
        path: './_js_requires.js'
      });
    });

    it('should inject the template functions into html require calls', function(done) {
      streamingTestFactory({
        path: './_html_requires.js',
        expectedOutputPath: './_html_requires__output.js',
        done: done
      });
    });

    it('should pass options down to lodash.template', function(done) {
      streamingTestFactory({
        path: './_html_requires.js',
        expectedOutputPath: './_html_requires__output_2.js',
        done: done,
        injectTemplateOptions: {
          variable: 'data'
        }
      });
    });
  });

  describe('in buffer mode', function() {
    it('should throw an exception', function() {
      var fakeFile = new File({
        contents: new Buffer('abufferwiththiscontent')
      });

      var injector = injectTemplate();

      expect(function() {
        injector.write(fakeFile);
      }).toThrowError(PluginError, 'Buffers are not supported.');
    });
  });
});

