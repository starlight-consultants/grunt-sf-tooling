
'use strict';

module.exports = function(grunt) {
	
	var sfInfo = grunt.file.readJSON('sfInfo.json');

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		
		clean: ['tmp', 'components'],
		
		// Global SalesForce setup
		sf_username: sfInfo.username,
		sf_password: sfInfo.password,

		// Configuration to be run (and then tested).
		sfpush: {
			default_options: {
			}
		},
		
		sfpull: {
			options: {
				classes: ['StickyLog', 'StickyClear'],
				pages: ['Test_Page']
			},
			default_options: {
			}
		},

		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js']
		}

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'sf_pull', 'nodeunit']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test']);

};
