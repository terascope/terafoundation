'use strict';

var _ = require('lodash');
var events = require('events');


function init_events(client) {
    var conn_events = new events.EventEmitter();

    /*client.on('error', function(error) {
     conn_events.emit('error', error);
     });*/

    return conn_events;
}

function create(customConfig) {
    var hdfsClient = require('node-webhdfs').WebHDFSClient;

    //logger.info("Using elasticsearch hosts: " + config.host);

    // TODO: there's no error handling here at all???
    var client = new hdfsClient(config);

    return {
        client: client,
        events: init_events(client)
    }
}

function config_schema() {
    return {
        user: {
            doc: '',
            default: 'webuser'
        },
        namenode_port: {
            doc: '',
            default: 50070
        },
        namenode_host: {
            doc: '',
            default: 'localhost'
        },
        path_prefix: {
            doc: '',
            default: '/webhdfs/v1'
        }
    }
}

module.exports = {
    create: create,
    config_schema: config_schema
};