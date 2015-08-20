Package.describe({
  name: 'chroma:reactive-summernote',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'provides a reactive template for instantiating the summernote editor',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use([
    "chroma:summernote",
    "coffeescript",
    "templating"
  ], "client");

  api.addFiles([
    "lib/reactive-summernote.js",
    "reactive-summernote.html"
  ], "client");
});



Package.onTest(function(api) {
  api.use('tinytest');
  api.use('chroma:reactive-summernote');
  api.addFiles('reactive-summernote-tests.js');
});
