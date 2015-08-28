Package.describe({
  name: 'chroma:reactive-summernote',
  version: '0.1.0',
  summary: 'provides a reactive template for the summernote editor, with support for cfs including s3',
  git: 'https://github.com/ChromaPDX/meteor-reactive-summernote.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    "templating",
    "underscore",
    "reactive-var",
    "dburles:mongo-collection-instances@0.3.4",
    "chroma:summernote@0.0.1"
  ]);

  api.addFiles([
    "reactive-summernote.html",
    "lib/reactive-summernote.js"
  ], "client");

  api.addFiles([
    "lib/publish.js"
  ], "server");

  api.export('Summernote', 'client');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('chroma:reactive-summernote');
  api.addFiles('reactive-summernote-tests.js');
});
