'use strict';

var events = require('events');
var Promise = require('bluebird');
var _ = require('lodash');

function create(customConfig, logger) {
    var hdfsClient = require('node-webhdfs').WebHDFSClient;
    logger.info("Using hdfs hosts: " + customConfig.host);

    //using first in list as the namenode_host
    var currentNameNode = customConfig.namenode_list[0];
    currentNameNode.namenode_host = currentNameNode;
    var client = new hdfsClient(customConfig);

    function makeNewClient() {
        var list = customConfig.namenode_list;
        //we want the next spot
        var index = list.indexOf(currentNameNode) + 1;
        //if empty start from the beginning of the
        var nameNodeHost = list[index] ? list[index] : list[0];
        currentNameNode = nameNodeHost;
        var newClient = new hdfsClient(_.assign({}, customConfig, {namenode_host: nameNodeHost}));

        return {
            client: Promise.promisifyAll(newClient)
        }
    }

    return {
        client: Promise.promisifyAll(client),
        changeNameNode: makeNewClient
    }
}

function config_schema() {
    return {
        user: {
            doc: 'user type for hdfs requests',
            default: 'hdfs',
            format: String
        },
        namenode_port: {
            doc: 'port of hdfs',
            default: 50070
        },
        namenode_list: {
            doc: '',
            default: [],
            format: function(val) {
                if (!Array.isArray(val)) {
                    throw new Error('namenode_list configuration must be set to an array')
                }
                if (val.length < 2) {
                    throw new Error("namenode_list must have at least two namenodes listed in the array")
                }
            }
        },
        path_prefix: {
            doc: 'endpoint for hdfs web interface',
            default: '/webhdfs/v1'
        }
    }
}

module.exports = {
    create: create,
    config_schema: config_schema
};