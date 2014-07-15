# grunt-sf-tooling

> Grunt tasks to retrieve and update SalesForce components via the Tooling API.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-sf-tooling --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-sf-tooling');
```

## The "sfpush" task

### Overview
In your project's Gruntfile, add a section named `sfpush` to the data object passed into `grunt.initConfig()`. This task lets you update components in SalesForce.

```js
grunt.initConfig({
  sf_password: 'Example Password',
  sf_username: 'example@example.com',
  sfpush: {
    options: {
      // Task-specific options go here.
      classes: ['ExampleApexClass']
    },
    sandbox: {
      options: {
        // Organization specific options
        loginServer: 'test.salesforce.com',
        username: 'example@example.com.example'
      }
    },
  },
});
```

### Options

#### options.apiVersion
Type: `String`
Default value: `'30.0'`

A string value that sets the SalesForce api version used.

#### options.classes
Type: `Array`
Default value: `[]`

An array that holds a list of Apex Classes to be saved.

#### options.containerName
Type: `String`
Default value: `'SF Grunt Container'`

A string value that is used as the Name of the MetadataContainer when saving SalesForce components.

#### options.loginServer
Type: `String`
Default value: `'login.salesforce.com'`

A string value that sets the server used to log into SalesForce.

#### options.pages
Type: `Array`
Default value: `[]`

An array that holds a list of Apex Pages to be saved.

#### options.password
Type: `String`
Default value: `null`

A string value that sets the password used to log into SalesForce. It can be set globally with the `sf_password` attribute.

#### options.triggers
Type: `Array`
Default value: `[]`

An array that holds a list of triggers to be saved.

#### options.username
Type: `String`
Default value: `null`

A string value that sets the username used to log into SalesForce. It can be set globally with the `sf_username` attribute.

#### options.validate
Type: `Boolean`
Default value: `false`

A boolean value that is used to control if SalesForce components are only validated and not saved.

#### options.workingFolder
Type: `String`
Default value: `'./components/'`

A string value that sets the path where SalesForce components are located.

### Usage Examples

*under construction*

## The "sfpull" task

### Overview

In your project's Gruntfile, add a section named `sfpull` to the data object passed into `grunt.initConfig()`. This task lets you download components from SalesForce.

```js
grunt.initConfig({
  sf_password: 'Example Password',
  sf_username: 'example@example.com',
  sfpull: {
    options: {
      // Task-specific options go here.
      classes: ['ExampleApexClass']
    },
    sandbox: {
      options: {
        // Organization specific options
        loginServer: 'test.salesforce.com',
        username: 'example@example.com.example'
      }
    },
  },
});
```

### Options

#### options.apiVersion
Type: `String`
Default value: `'30.0'`

A string value that sets the SalesForce api version used.

#### options.classes
Type: `Array`
Default value: `[]`

A array that holds a list of Apex Classes to be pulled with the `sf_pull` task.

#### options.containerName
Type: `String`
Default value: `'SF Grunt Container'`

A string value that is used as the Name of the MetadataContainer when saving SalesForce components.

#### options.loginServer
Type: `String`
Default value: `'login.salesforce.com'`

A string value that sets the server used to log into SalesForce.

#### options.pages
Type: `Array`
Default value: `[]`

An array that holds a list of Apex Pages to be downloaded.

#### options.password
Type: `String`
Default value: `null`

A string value that sets the password used to log into SalesForce. It can be set globally with the `sf_password` attribute.

#### options.triggers
Type: `Array`
Default value: `[]`

An array that holds a list of Apex Triggers to be downloaded.

#### options.username
Type: `String`
Default value: `null`

A string value that sets the username used to log into SalesForce. It can be set globally with the `sf_username` attribute.

#### options.workingFolder
Type: `String`
Default value: `'./components/'`

A string value that sets the path where SalesForce components are located.

### Usage Examples

*under construction*
