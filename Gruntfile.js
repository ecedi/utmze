'use strict';
/* global module */


module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/**\n * <%= pkg.name %>.js\n * @version <%= pkg.version %>\n * @build <%= grunt.template.today("yyyy-mm-dd") %> \n * @copyright (c) 2014 Agence Ecedi http://ecedi.fr\n * @author Sylvain Gogel <sgogel@ecedi.fr>\n * @licence MIT\n */\n',
	      mangle: {
	        except: ['jQuery', 'console', 'document']
	      }        
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};