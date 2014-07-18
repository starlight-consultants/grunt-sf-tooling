/*
 * Grunt SalesForce Tooling Tasks
 * 
 * Defines the sfpush and sfpull tasks
 * 
 */

var request = require('request');
var async = require('async');

'use strict';

module.exports = function(grunt) {

	var sf_util = require('./sf_util.js')(grunt);
	var DEFAULT_OPTIONS = {
		loginServer: 'login.salesforce.com',
		apiVersion: '30.0',
		containerName: 'SF Grunt Container',
		username: grunt.config.get('sf_username'),
		password: grunt.config.get('sf_password'),
		classes: [],
		pages: [],
		triggers: [],
		workingFolder: './components/',
		validate: false
	};

	grunt.registerMultiTask('sfpush', 'Update SalesForce components with the tooling API', function() {
		var done = this.async();
		
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options(DEFAULT_OPTIONS);
		if(!options.username || !options.password) {
			grunt.log.error('username and password required');
			done(false);
			return;
		}
		
		// Talk to the server
		var deleteContainerId = null;
		async.waterfall([
			// Get an access token
			function(cb) {
				sf_util.login(cb, options);
			},
			// Search for Metadata Container
			function(pkg, cb) {
				sf_util.query('SELECT Id FROM MetadataContainer WHERE Name = \'' + options.containerName + '\'', function(err, data) {
					if(data.size > 0) {
						pkg.containerId = data.records[0].Id;
						deleteContainerId = data.records[0].Id;
						cb(null, false, pkg);
					} else {
						cb(null, true, pkg);
					}
				});
			},
			// Create Metadata Container (if needed)
			function(doInsert, pkg, cb) {
				if(!doInsert) {
					grunt.log.ok('Found existing container: ' + pkg.containerId);
					cb(null, pkg);
				} else {
					request({
						method: 'POST',
						url: pkg.apiUrl + '/sobjects/MetadataContainer',
						json: {Name: options.containerName},
						headers: { Authorization: 'Bearer ' + pkg.token }
					}, function(err, response, body) {
						pkg.containerId = body.id;
						deleteContainerId = body.id;
						grunt.log.ok('Created new container: ' + pkg.containerId);
						cb(null, pkg);
					});
				}
			},
			// Create component containers
			function(pkg, cb) {
				async.map(grunt.file.expand(options.workingFolder + '**/*-meta.json'), function(metaFile, mapCb) {
					var cmpMeta = grunt.file.readJSON(metaFile);
					
					// Verify the read component is part of this target
					var isInTarget = false;
					Object.keys(sf_util.types).forEach(function(key) {
						if(isInTarget) return;
						if(options[key].indexOf(cmpMeta.name) >= 0) {
							isInTarget = true;
						}
					});
					if(!isInTarget) {
						mapCb();
						return;
					}
					
					// Verify the source code exists
					var srcFile = /^(.*\/)(.*?)-meta\.json$/.exec(metaFile)[1] + cmpMeta.source;
					if(!grunt.file.exists(srcFile)) {
						grunt.log.error(srcFile + ' does not exist and will not be saved');
						mapCb();
						return;
					}
					
					// Create member sObject
					request({
						method: 'POST',
						url: pkg.apiUrl + '/sobjects/' + cmpMeta.container,
						json: {
							ContentEntityId: cmpMeta.id,
							MetadataContainerId: pkg.containerId,
							Body: grunt.file.read(srcFile)
						},
						headers: { Authorization: 'Bearer ' + pkg.token }
					}, function(err, response, body) {
						if(err) {
							mapCb(err);
							return;
						}
						
						// Check for server error
						if(!!body[0]) {
							if(!!body[0].errorCode) {
								mapCb('Error saving members: ' + body[0].message);
								return;
							}
						}
						
						mapCb(null, cmpMeta.container);
					});
				}, function(err, datas) {
					if(err) {
						cb(err);
						return;
					}
					
					var sumMap = {};
					datas.forEach(function(container) {
						if(!container) return;
						if(!sumMap[container]) sumMap[container] = 1;
						else sumMap[container] = sumMap[container] + 1;
					});
					Object.keys(sumMap).forEach(function(container) {
						grunt.log.ok('Added ' + sumMap[container] + ' ' + container + 's');
					});
					
					cb(null, pkg);
				});
			},
			// Save the container with Async Request
			function(pkg, cb) {
				request({
					method: 'POST',
					url: pkg.apiUrl + '/sobjects/ContainerAsyncRequest',
					json: {
						IsCheckOnly: options.validate,
						MetadataContainerId: pkg.containerId
					},
					headers: { Authorization: 'Bearer ' + pkg.token }
				}, function(err, response, body) {
					if(err) {
						cb(err);
						return;
					}
					
					if(!body.success) {
						cb(body.errors);
						return;
					}
					
					pkg.requestId = body.id;
					grunt.log.ok('Created update request: ' + body.id);
					cb(null, pkg);
				});
			},
			// Get Async Request status until complete
			function(pkg, cb) {
				var updateStatus = null;
				async.whilst(
					function() { return updateStatus != 'Failed' && updateStatus != 'Completed'; },
					function(wCb) {
						request({
							url: pkg.apiUrl + '/sobjects/ContainerAsyncRequest/' + pkg.requestId,
							headers: { Authorization: 'Bearer ' + pkg.token }
						}, function(err, response, body) {
							if(err) {
								wCb(err);
								return;
							}
							res = JSON.parse(body);
							
							updateStatus = res.State;
							
							// Check for compile errors
							if(!!res.CompilerErrors) {
								var cErrors = JSON.parse(res.CompilerErrors);
								if(cErrors.length > 0) {
									cErrors.forEach(function(cErr) {
										var lineText = '';
										if(cErr.line != null) lineText = ' [line: ' + cErr.line + ']';
										grunt.log.error('Compile Error in ' + cErr.extent + ' ' + cErr.name + lineText);
										grunt.log.error('|    ' + cErr.problem);
									});
									
									wCb('Compiler errors stopping save');
									return;
								}
							}
							
							// Check for errors
							if (!!res.ErrorMsg) {
								wCb(res.ErrorMsg);
								return;
							}
							
							setTimeout(wCb, 1000);
						});
					},
					function(err) {
						if(err) {
							cb(err);
							return;
						}
						
						grunt.log.ok('All SalesForce components saved');
						cb();
					}
				);
			}
		], function(err, pkg) {
			if(err) grunt.log.error(err);
			
			// Delete the metadata container
			sf_util.clean(deleteContainerId, function(err) {
				if(err) {
					grunt.log.error(err);
					done(false);
					return;
				}
				done();
			});
			
		});
		
	});
	
	grunt.registerMultiTask('sfpull', 'Download SalesForce components with the tooling API', function() {
		var done = this.async();
		
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options(DEFAULT_OPTIONS);
		
		// Verify the options
		if(!options.username || !options.password) {
			grunt.log.error('username and password required');
			done(false);
			return;
		}
		
		async.waterfall([
			// Login
			function(cb) { sf_util.login(cb, options); },
			
			// Load components
			function(loginInfo, cb) {
				
				// Get components to load
				var componentList = [];
				Object.keys(sf_util.types).forEach(function(key) {
					componentList.push({
						metaInfo: sf_util.types[key],
						members: options[key]
					});
				});
				
				// Query all the components
				async.map(componentList, function(cmp, mapCb) {
					var fields = [];
					Object.keys(cmp.metaInfo.queryMap).forEach(function(sfField) {
						fields.push(sfField);
					});
					var cmpQuery = 'SELECT ' + fields.join(',') + ' FROM ' + cmp.metaInfo.sObject + ' WHERE Name IN (\'' + cmp.members.join('\',\'') + '\')';
					sf_util.query(cmpQuery, function(err, data) {
						if(err) {
							mapCb(err);
							return;
						}
						
						// Write the component to a file
						var cmpOutFolder = options.workingFolder + cmp.metaInfo.outputFolder + '/';
						var writeCount = 0;
						data.records.forEach(function(apexClass) {
							var cmpFile = cmpOutFolder + apexClass.Name + cmp.metaInfo.extension;
							grunt.file.write(cmpFile, apexClass[cmp.metaInfo.bodyField || 'Body']);
							
							var cmpMetaFile = cmpOutFolder + apexClass.Name + '-meta.json';
							var cmpMeta = {};
							Object.keys(cmp.metaInfo.queryMap).forEach(function(sfField) {
								if(!cmp.metaInfo.queryMap[sfField]) return;
								cmpMeta[cmp.metaInfo.queryMap[sfField]] = apexClass[sfField];
							});
							cmpMeta.container = cmp.metaInfo.container;
							cmpMeta.source = apexClass.Name + cmp.metaInfo.extension;
							grunt.file.write(cmpMetaFile, JSON.stringify(cmpMeta, null, '\t'));
							
							writeCount++;
						});
						
						if(writeCount > 0)
							grunt.log.ok('Downloaded ' + writeCount + ' ' + cmp.metaInfo.sObject + ' records');
						mapCb();
						
					});
				}, function(err, data) {
					if(err) {
						cb(err);
						return;
					}
					
					cb();
				})
			}
		], function(err, result) {
			if(err) {
				grunt.log.error(err);
				done(false);
				return;
			}
			done();
		});
		
	});
	
};
