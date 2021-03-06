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

## The "sf" task

### Overview
In your project's Gruntfile, add a section named `sfpush` to the data object passed into `grunt.initConfig()`. This task lets you update components in SalesForce.

```js
grunt.initConfig({
  sf: {
    sampleTarget: {
      classes: ['ClassName'],
      triggers: ['TriggerName'],
      pages: ['PageName']
    }
  }
});
```

### Usage Examples

*under construction*

### Including Components
To include components in a certain target use the following attributes.

#### classes
Array of Apex Class names to include in this target.

#### triggers
Array of Apex Trigger names to include in this target.

#### pages
Array of VisualForce Page names to include in this target.

### Options

#### options.apiVersion
Type: `String`
Default value: `'30.0'`

A string value that sets the SalesForce api version used.

#### options.containerName
Type: `String`
Default value: `'SF Grunt Container'`

A string value that is used as the Name of the MetadataContainer when saving SalesForce components.

#### options.sandboxServer
Type: `String`
Default value: `'test.salesforce.com'`

A string value that set the server used to log into sandbox.

#### options.productionServer
Type: `String`
Default value: `'login.salesforce.com'`

A string value that sets the server used to log into production.

#### options.workingFolder
Type: `String`
Default value: `'./components/'`

A string value that sets the path where SalesForce components are located.
