/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title %> | <%= pkg.homepage %> | ' + 
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    lint: {
      files: [
        'src/Tile.js',
        'src/Template.js',
        'src/UniformTemplates.js',
        'src/Grid.js'
      ]
    },
    concat: {
      dist: {
        src: [ '<banner>', '<config:lint.files>' ],
        dest: '<%= pkg.name %>.js'
      },
    },
    min: {
      dist: {
        src: [ '<banner>', '<config:lint.files>' ],
        dest: '<%= pkg.name %>.min.js'
      },
    },
    watch: {
      cj: {
        files: '<config:lint.files>',
        tasks: 'concat min'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true,
        Tiles: true
      }
    },
    uglify: {}
  });

  // by default only concat cj files
  grunt.registerTask('default', 'lint concat min');

};
