'use strict';

module.exports = function(context) {
    var context = context;
    var logger = context.logger;

    return function(num, descriptor, job) {
        var cluster = context.cluster;
        var options = {};
        var type = descriptor ? descriptor : 'worker';
        var id = null;

        options[type] = true;

        if (job) {
            options.job = job;
            var parsedJob = JSON.parse(job);
            id = parsedJob.__id;
            options.jobID = id;
        }

        if (cluster.isMaster) {
            logger.info('Starting ' + num + ' ' + type);
            for (var i = 0; i < num; i++) {
                var worker = cluster.fork(options);

                //for cluster master reference, when a worker dies, you don't have access to its env at master level
                worker.assignment = type;
                worker.job = job;
                worker.jobID = id;
            }
        }

    }

};