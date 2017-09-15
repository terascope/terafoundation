'use strict';

const bunyan = require('bunyan');
const fs = require('fs');
const _ = require('lodash');
const RingBuffer = require('../logger_utils').RingBuffer;
const Promise = require('bluebird');

function getLogLevel(level) {
    if (typeof level === 'string') {
        return { console: level, file: level, elasticsearch: level };
    }

    return level.reduce((prev, curr) => {
        _.assign(prev, curr);
        return prev;
    }, {});
}

module.exports = function module(context) {
    const config = context.sysconfig;

    const logLevel = getLogLevel(context.sysconfig.terafoundation.log_level);
    let logger;

    return function makeLogger(name, destination, _meta) {
        if (logger) {
            const meta = _meta || {};

            // subsequent child loggers don't need name or destination,
            // check to see if name parameter is actual _meta
            const metaData = typeof name === 'object' ? name : meta;
            const newLogger = logger.child(metaData);
            // add flush fn to the new logger
            newLogger.flush = logger.flush;

            return newLogger;
        }

        const streamConfig = [];
        let ringBuffer = false;
        const environment = config.terafoundation.environment;

        if (environment !== 'production' && environment === 'development' || _.include(config.terafoundation.logging, 'console')) {
            var level = logLevel.console ? logLevel.console : 'info';
            streamConfig.push({ stream: process.stdout, level });
        }

        if (environment === 'production' || _.include(config.terafoundation.logging, 'file')) {
            const configPath = config.terafoundation.log_path ? config.terafoundation.log_path : './logs';
            // remove whitespace
            const dir = destination.replace(/ /g, '');

            try {
                if (fs.lstatSync(configPath).isDirectory()) {
                    var level = logLevel.console ? logLevel.console : 'info';
                    streamConfig.push({ path: `${configPath}/${dir}.log`, level });
                } else {
                    throw ' log_path is not a directory';
                }
            } catch (e) {
                throw 'No valid log_path is specified';
            }
        }

        if (_.include(config.terafoundation.logging, 'elasticsearch')) {
            var name = context.cluster_name;
            const limit = config.terafoundation.log_buffer_limit;
            const delay = config.terafoundation.log_buffer_interval;
            const timeseriesFormat = context.sysconfig.terafoundation.log_index_rollover_frequency;

            ringBuffer = new RingBuffer(name, limit, delay, null, timeseriesFormat);
            streamConfig.push({ stream: ringBuffer, type: 'raw' });
        }


        const loggerConfig = {
            name,
            level: logLevel.elasticsearch,
            streams: streamConfig
        };

        logger = bunyan.createLogger(loggerConfig);

        if (ringBuffer) {
            logger.flush = ringBuffer.flush.bind(ringBuffer);
        } else {
            logger.flush = () => Promise.resolve(true);
        }

        return logger;
    };
};
