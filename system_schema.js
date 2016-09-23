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
    log_level: {
        doc: 'what level of logs should be used by the bunyan logger',
        default: 'info',
        format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
    },
    log_buffer_limit: {
        doc: 'the number of logs stored in the ringbuffer on the logger before sent, logging must have elasticsearch set as a value for this to take effect',
        default: 30,
        format: function(val) {
            if (isNaN(val)) {
                throw new Error('log_buffer_limit parameter for terafoundation must be a number')
            }
            else {
                if (val <= 10) {
                    //the buffer need to be sufficiently large enough to keep all logs before the client is instantiated
                    //an error will throw if the buffer limit is reached before client is provided
                    throw new Error('log_buffer_limit parameter for terafoundation must be greater than 10')
                }
            }
        }
    },
    log_buffer_interval: {
        doc: 'interval (number in milliseconds) that the log buffer will send up its logs',
        default: 10000,
        format: function(val) {
            if (isNaN(val)) {
                throw new Error('log_buffer_interval parameter for terafoundation must be a number')
            }
            else {
                if (val <= 1000) {
                    //the buffer need to be sufficiently large enough to keep all logs before the client is instantiated
                    //an error will throw if the buffer limit is reached before client is provided
                    throw new Error('log_buffer_interval parameter for terafoundation must be greater than a 1000 ms')
                }
            }
        }
    },
    workers: {
        doc: 'Number of workers per server',
        default: workerCount
    }

};
