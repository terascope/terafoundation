'use strict';
var bunyan = require('bunyan');
var fs = require('fs');
var ES_Stream = require('../logger_utils');

function getIdentifiers(context) {
    var env = {};

    if (process.env.service_context) {
        var processENV = JSON.parse(process.env.service_context);
        //dont need the job
        delete processENV['job'];

        return processENV;
    }

    return env;
}

module.exports = function(context) {
    var config = context.sysconfig;

    return function(name, destination, identifiers) {
        var streamConfig = [];

        if (config.terafoundation.environment === 'development' || config.terafoundation.logging === 'console') {
            streamConfig.push({stream: process.stdout});
        }

        if (config.terafoundation.environment === 'production' || config.terafoundation.logging === 'file') {
            var configPath = config.terafoundation.log_path;
            //remove whitespace
            var destination = destination.replace(/ /g, '');

            try {
                if (fs.lstatSync(configPath).isDirectory()) {
                    streamConfig.push({path: configPath + '/' + destination + '.log'});
                }
                else {
                    throw " log_path is not a directory"
                }
            }
            catch (e) {
                throw "No valid log_path is specified"
            }
        }

        if (config.terafoundation.logging === 'elasticsearch') {
            var name = 'terafoundation';

            if (config.teraslice && config.teraslice.cluster) {
                name = config.teraslice.cluster.name;
            }

            // use default for other systems not using teraslice
            var host = config.terafoundation.connectors['default'];

            if (config.teraslice.cluster.state) {
                var connection = config.teraslice.cluster.state.connection;
                host = config.terafoundation.connectors[connection];
            }

            //used to put identifiers on the logging messages sent up to elasticsearch
            var idObj = identifiers ? identifiers : getIdentifiers(context);

            var esStream = new ES_Stream({
                index: name,
                type: 'logs',
                host: host
            }, idObj);

            /*esStream.on('error', function (err) {
             console.log('Elasticsearch Stream Error:', err.stack);
             });*/

            streamConfig.push({stream: esStream})
        }
        console.log('whats in the streams', streamConfig);
        var loggerConfig = {
            name: name,
            streams: streamConfig
        };

        return bunyan.createLogger(loggerConfig);
    }
};