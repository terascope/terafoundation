'use strict';

var sys_schema = require('../system_schema');
var _ = require('lodash');
var fs = require('fs');

function getPlugin(name, configFile) {

    var firstPath = configFile.TeraServer.plugins_path + '/' + name;

    try {
        if (fs.existsSync(firstPath)) {
            return require(firstPath);
        }
        else {
            return require(name);
        }
    }
    catch (e) {
        throw new Error('Could not retrieve plugin code for: ' + name + '\n' + e);
    }
}

module.exports = function(context, configFile) {
    var schema = {};

    _.forOwn(configFile, function(value, key) {
        if (configFile[key].plugins) {
            var plugins = configFile[key].plugins;

            plugins.forEach(function(name) {
                var code = getPlugin(name, configFile);
                var pluginSchema = code.schema();
                schema[name] = pluginSchema;
            });

        }
    });

    schema.Terafoundation = sys_schema;
    schema[context.name] = context.config_schema();

    return schema;
};