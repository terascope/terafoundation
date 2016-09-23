'use strict';

var util = require('util');
var moment = require('moment');
var bunyan = require('bunyan');

var levelsObj = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
};

function RingBuffer(limit, client) {
    var rlimit = limit ? limit : 500;

    if (client) {
        this.client = client;
    }

    bunyan.RingBuffer.call(this, {limit: rlimit})
}
util.inherits(RingBuffer, bunyan.RingBuffer);

RingBuffer.prototype.write = function(record) {
    if (!this.writable) {
        throw (new Error('RingBuffer has been ended already'));
    }
    this.records.push(record);

    if (this.records.length >= this.limit) {
        //this.emit('limit');
        this.sendBulk();
    }

    return (true);
};

RingBuffer.prototype.sendBulk = function() {
    var data = this.records.slice();
    var client = this.client;
    this.records = [];
//todo fix this hard bound reference
    var esData = data.reduce(function(prev, record) {
        prev.push({
            "index": {
                "_index": 'teracluster__logs-' + moment(record.time).format('YYYY.MM.DD'),
                "_type": "logs"
            }
        });
        prev.push(parseRecord(record));
        return prev;
    }, []);
    //console.log(esData);
    return client.bulk({body: esData})
};

RingBuffer.prototype.flush = function() {
    console.log('flush getting called');
    return this.sendBulk();
};

RingBuffer.prototype.setBufferClient = function(client) {
    this.client = client;
};

function loggerClient(context, logger) {
    var esClient = logger.streams.filter(function(stream){
        //console.log('the stream', instanceOf(stream.stream))
        if(stream.stream instanceof RingBuffer){
            return stream
        }
    });

    if (esClient.length > 0) {
        var client = context.foundation.getConnection({type: 'elasticsearch', cached: true}).client;
        esClient[0].stream.setBufferClient(client)
    }
}

function parseRecord(record){
    record.levels = levelsObj[record.levels]
}


module.exports = {
    RingBuffer: RingBuffer,
    loggerClient: loggerClient
};
