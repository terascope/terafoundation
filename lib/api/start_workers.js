'use strict';

module.exports = function(context) {
    var context = context;
    var logger = context.logger;

    return function(num, descriptor, job) {
        var cluster = context.cluster;
        var options = {};

        if (descriptor) {
            options[descriptor] = true;
        }

        if(job) {
           // console.log('what job', job);
            options.job = job
        }

        if (cluster.isMaster) {
            logger.info("Starting " + num + " workers.");
            for (var i = 0; i < num; i++) {
                //console.log('this is options',options);
                var worker = cluster.fork(options);
               //for cluster master reference, when a worker dies, you don't have access to its env at master level
                worker.assignment = descriptor;
            }
        }

    }

};