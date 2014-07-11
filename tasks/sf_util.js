/* 
 * SalesForce Utility
 * 
 * Provides handy methods for communicating with SalesForce
 * 
 */
var request = require('request');
var async = require('async');

var OAUTH_CLIENT_KEY = '3MVG9A2kN3Bn17hty.PtbjpbVaNnmgztJtxHM0Z83KEsYPRx6LVADUYGQ8vdo24IGOHbFdt5sl.gG3lOjaf5J';
var OAUTH_SECRET = '7405946086932698608';

module.exports = function(grunt) {
	
	// Log in
	var pkg = {};
	var login = function(cb, options) {
		request({
			method: 'POST',
			url: 'https://' + options.loginServer + '/services/oauth2/token',
			form: {
				grant_type: 'password',
				client_id: OAUTH_CLIENT_KEY,
				client_secret: OAUTH_SECRET,
				username: options.username,
				password: options.password
			}
		}, function(err, response, body) {
			
			// Check for HTTP error
			if(err) {
				cb(err);
				return;
			}
			var res = JSON.parse(body);
			
			// Check for Authentication error
			if(!!res.error) {
				cb('Cannot log in: ' + res.error_description);
				return;
			}
			
			
			grunt.log.ok('Successfully logged ' + options.username);
			pkg = {
				token: res.access_token,
				instance: res.instance_url,
				apiUrl: res.instance_url + '/services/data/v' + options.apiVersion + '/tooling'
			};
			cb(null, pkg);
			
		});
	}
	
	var getPkg = function() {
		return pkg;
	}
	
	// Query
	var query = function(query, callback) {
		
		// Verify query isn't blank
		if(!query) {
			callback('No query specified');
			return;
		}
		
		request({
			url: pkg.apiUrl + '/query',
			qs: {
				q: query
			},
			headers: { Authorization: 'Bearer ' + pkg.token }
		}, function(err, response, body) {
			if(err) {
				callback(err);
				return;
			}
			
			var res = JSON.parse(body);
			if(!!res[0]) {
				if(!!res[0].errorCode) {
					callback(res[0].message);
					return;
				}
			}
			
			callback(null, res);
		});
	}
	
	// Clean
	var clean = function(containerId, callback) {
		
		// Verify that we have a container to delete
		if(!containerId) {
			callback();
			return;
		}
		
		request({
			url: pkg.apiUrl + '/sobjects/MetadataContainer/' + containerId,
			method: 'DELETE',
			headers: { Authorization: 'Bearer ' + pkg.token }
		}, function(err, response, body) {
			grunt.log.writeln(body);
			if(err) {
				callback(err);
				return;
			}
			
			var res = [];
			try {
				res = JSON.parse(body);
			} catch(e) {
				
			}
			
			if(!!res[0]) {
				if(!!res[0].errorCode) {
					callback(res[0].message);
					return;
				}
			}
			
			callback();
		});
	}
	
	// Metadata types
	var types = {
		classes: {
			sObject: 'ApexClass',
			container: 'ApexClassMember',
			queryMap: {
				Id: 'id',
				Name: 'name',
				Body: null,
				ApiVersion: 'apiVersion',
				Status: 'status'
			},
			outputFolder: 'classes',
			extension: '.cls'
		},
		triggers: {
			sObject: 'ApexTrigger',
			container: 'ApexTriggerMember',
			queryMap: {
				Id: 'id',
				Name: 'name',
				Body: null,
				ApiVersion: 'apiVersion',
				Status: 'status'
			},
			outputFolder: 'triggers',
			extension: '.trigger'
		},
		pages: {
			sObject: 'ApexPage',
			container: 'ApexPageMember',
			queryMap: {
				Id: 'id',
				Name: 'name',
				Markup: null,
				ApiVersion: 'apiVersion'
			},
			outputFolder: 'pages',
			extension: '.page',
			bodyField: 'Markup'
		}
	}
	
	return {
		login: login,
		types: types,
		query: query,
		getPkg: getPkg,
		clean: clean
	};
	
};