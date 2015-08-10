/*global module:false*/
module.exports = function(grunt) {

    var BANNER_TEMPLATE = '/*! <%= pkg.title %> v<%= pkg.version %> | <%= pkg.homepage %> */\n';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: BANNER_TEMPLATE
            },
            dist: {
                src: [
                    'src/Tile.js',
                    'src/Template.js',
                    'src/UniformTemplates.js',
                    'src/Grid.js'
                ],
                dest: 'dist/tiles.js'
            }
        },
        jshint: {
            files: [ 'gruntfile.js', 'src/*.js' ],
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
                browser: true,
                globals: {
                    jQuery: true,
                    Tiles: true,
                    console: true
                }
            }
        },
        watch: {
            cj: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint', 'concat', 'copy', 'uglfiy']
            }
        },
        uglify: {
            options: {
                banner: BANNER_TEMPLATE
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: 'dist/tiles.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
