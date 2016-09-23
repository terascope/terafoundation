'use strict';
var bunyan = require('bunyan');
var fs = require('fs');
var _ = require('lodash');
var RingBuffer = require('../logger_utils').RingBuffer;
var Promise = require('bluebird');


module.exports = function(context) {
    var config = context.sysconfig;

    return function(name, destination) {
        var streamConfig = [];
        var ringBuffer = false;

        if (config.terafoundation.environment === 'development' || _.include(config.terafoundation.logging, 'console')) {
            streamConfig.push({stream: process.stdout});
        }

        if (config.terafoundation.environment === 'production' || _.include(config.terafoundation.logging, 'file')) {
            var configPath = config.terafoundation.log_path ? config.terafoundation.log_path : './logs';
            //remove whitespace
            var dir = destination.replace(/ /g, '');

            try {
                if (fs.lstatSync(configPath).isDirectory()) {
                    streamConfig.push({path: configPath + '/' + dir + '.log'});
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
            ringBuffer = new RingBuffer(15);
            streamConfig.push({stream: ringBuffer, type: 'raw'})
        }


        var loggerConfig = {
            name: name,
            streams: streamConfig
        };

        var logger = bunyan.createLogger(loggerConfig);
        
        if (ringBuffer) {
            logger.flush = ringBuffer.flush.bind(ringBuffer);
        }
        else {
            logger.flush = function(){return Promise.resolve(true)}
        }
        
        return logger
    }
};