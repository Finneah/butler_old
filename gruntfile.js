const {file} = require('grunt');

/* eslint-disable no-labels */
module.exports = function(grunt) {
  var filename = grunt.option('name') + '.js';
  var destination = filename;
  switch (grunt.option('type')) {
    case 'cmp':
      destination = 'components/' + filename;
      break;
    case 'screen':
      destination = 'screens/' + filename;
      break;

    default:
      destination = filename;
      break;
  }

  pkg: grunt.file.readJSON('package.json'),
    grunt.initConfig({
      jsdoc: {
        dist: {
          src: ['.src/screens/*', './src/components/*'],
          dest: './doc',
          options: {
            destination: './doc',
            readme: './README.md',
          },
        },
      },
      copy: {
        // grunt copy:main --name=NAME --type=screen
        main: {
          src: './CopyTemplates/default.js',
          dest: 'src/' + destination,
          filename: 'testfile',
          options: {
            process: function(content, srcpath) {
              var className = grunt.option('name');
              return content.replace(/CLASS_NAME/g, className);
            },
          },
        },
        // grunt copy:cmp --name=NewEntryModal --type=cmp
        cmp: {
          src: './CopyTemplates/component.js',
          dest: 'src/' + destination,
          filename: 'testfile',
          options: {
            process: function(content, srcpath) {
              var className = grunt.option('name');
              return content.replace(/CLASS_NAME/g, className);
            },
          },
        },
      },
    });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.registerTask('default', ['jsdoc']);
};
