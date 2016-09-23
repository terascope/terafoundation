'use strict';
var bunyan = require('bunyan');
var fs = require('fs');
var _ = require('lodash');
var RingBuffer = require('../logger_utils').RingBuffer;
var Promise = require('bluebird');


module.exports = function(context) {
    var config = context.sysconfig;
    var log_level = context.sysconfig.log_level;
    var logger;

    return function(name, destination, meta) {
        if (logger) {
            var metaData = meta ? meta : {};
            var newLogger = logger.child(metaData);
            //add flush fn to the new logger
            newLogger.flush = logger.flush;

            return newLogger;
        }
        else {
            var streamConfig = [];
            var ringBuffer = false;
            var environment = config.terafoundation.environment;

            if (environment !== 'production' && environment === 'development' || _.include(config.terafoundation.logging, 'console')) {
                streamConfig.push({stream: process.stdout, level: log_level});
            }

            if (environment === 'production' || _.include(config.terafoundation.logging, 'file')) {
                var configPath = config.terafoundation.log_path ? config.terafoundation.log_path : './logs';
                //remove whitespace
                var dir = destination.replace(/ /g, '');

                try {
                    if (fs.lstatSync(configPath).isDirectory()) {
                        streamConfig.push({path: configPath + '/' + dir + '.log', level: log_level});
                    }
                    else {
                        throw " log_path is not a directory"
                    }
                }
                catch (e) {
                    throw "No valid log_path is specified"
                }
            }

            if (_.include(config.terafoundation.logging, 'elasticsearch')) {
                var name = context.cluster_name;
                var limit = config.terafoundation.log_buffer_limit;
                var delay = config.terafoundation.log_buffer_interval;

                ringBuffer = new RingBuffer(name, limit, delay, null);
                streamConfig.push({stream: ringBuffer, type: 'raw'})
            }


            var loggerConfig = {
                name: name,
                level: log_level,
                streams: streamConfig
            };

            logger = bunyan.createLogger(loggerConfig);

            if (ringBuffer) {
                logger.flush = ringBuffer.flush.bind(ringBuffer);
            }
            else {
                logger.flush = function() {
                    return Promise.resolve(true)
                }
            }

            return logger
        }
    }
};