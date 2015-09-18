'use strict';

module.exports = {
    environment: {
        doc: '',
        default: 'development'
    },
    log_path: {
        default: '/Users/jarednoble/Desktop/logs'
    },
    elasticsearch: {
        default: {
            doc: '',
            default: {
                host: ["127.0.0.1:9200"],
                keepAlive: false,
                maxRetries: 5,
                maxSockets: 20
            }
        }
    },
    statsd: {
        default: {
            default: {
                host: '127.0.0.1',
                mock: false
            }
        }
    },
    mongodb: {
        replicaSet: {
            doc: "",
            default: "app"
        },
        replicaSetTimeout: {
            doc: "",
            default: 30000
        },
        default: {
            doc: '',
            default: {servers: "mongodb://localhost:27017/teratest"}
        }
    }

};


/*config.teranaut = {};
 config.teranaut.auth = {};
 config.teranaut.auth.open_signup = true;
 config.teranaut.auth.require_email = true;*/

/*
 ***********************
 API Service Configuration
 ***********************
 */
/*config.api = {};

 config.api.workers = 1;

 config.api.port = 8000;

 config.api.ssl_path = '/app/config/ssl';

 //config.api.redis_ip = '127.0.0.1';

 config.api.plugins = ['teranaut'];

 // Location of service plugins
 config.api.plugins_path = '/app/api/plugins';

 // Location of static HTTP assets.
 config.api.static_assets = '/app/api/public';

 config.api.log = '/app/logs/api.log';*/

//module.exports = config;