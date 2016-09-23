'use strict';
var workerCount = require('os').cpus().length;

var dirPath = process.cwd();

module.exports = {
    environment: {
        doc: 'Set for legacy purposes, if set to production, it will also write logs to file',
        default: 'development'
    },
    log_path: {
        doc: 'directory where the logs will be stored if logging is set to file',
        default: dirPath,
        format: String
    },
    logging: {
        doc: 'options to specify which logging functionality to use',
        default: ['console'],
        format: function(config) {
            var values = {console: true, file: true, elasticsearch: true};
            if (!Array.isArray(config)) {
                throw new Error('value for logging set in terafoundation must be an array')
            }

            config.forEach(function(type) {
                if (!values[type]) {
                    throw new Error('value: ' + type + ' is not a valid configuration for logging')
                }
            })
        }
    },
    workers: {
        doc: 'Number of workers per server',
        default: workerCount
    }

};
