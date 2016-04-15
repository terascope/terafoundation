'use strict';

var Writable = require('stream').Writable;
var util = require('util');
var elasticsearch = require('elasticsearch');
var moment = require('moment');
var _ = require('lodash');

var levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
};

function ElasticsearchStream(options, idObj) {
    options = options || {};
    this._client = options.client || new elasticsearch.Client(options);
    this._type = options.type || 'logs';
    this._index = options.index;
    this._idObj = idObj;
    Writable.call(this, options);
}

util.inherits(ElasticsearchStream, Writable);

ElasticsearchStream.prototype._write = function(entry, encoding, callback) {

    var client = this._client;
    var index = this._index + '__logs';
    var type = this._type;

    //this contains identifiers like node_id, job_id etc
    var idObj = this._idObj;

    entry = JSON.parse(entry.toString('utf8'));

    entry['@timestamp'] = entry.time;
    entry.level = levels[entry.level];
    entry.message = entry.msg;

    // remove duplicate fields
    delete entry.time;
    delete entry.msg;

    _.assign(entry, idObj);
    //TODO this might make wrong dates, make it seem like tomorrow
    var datestamp = moment(entry.timestamp).format('YYYY.MM.DD');

    var options = {
        index: index + '-' + datestamp,
        type: type,
        body: entry
    };

    var self = this;
    client.create(options, function(err, resp) {
        if (err) {
            self.emit('error', err);
        }
        callback();
    });
};

module.exports = ElasticsearchStream;