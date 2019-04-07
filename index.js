'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2019
 * @license LGPL-3.0
 */

let Client, ReconnectingClient;

exports.Client = function (opts) {
    if (opts.reconnect) {
        ReconnectingClient = ReconnectingClient || require('./lib/ReconnectingClient.js');
        return new ReconnectingClient(opts);

    } else {
        Client = Client || require('./lib/Client.js');
        return new Client(opts);
    }
};
