'use strict';
var workerCount = require('os').cpus().length;

var dirPath = process.cwd();

module.exports = {
    environment: {
        doc: '',
        default: 'development'
    },
    log_path: {
        doc: 'directory where the logs will be stored in logging is set to file',
        default: dirPath
    },
    logging: {
        doc: 'options to specify which logging functionality to use',
        default: 'console',
        format: ['console', 'file', 'elasticsearch']
    },
    workers: {
        doc: 'Number of workers per server',
        default: workerCount
    }

};
