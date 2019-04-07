'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2019
 * @license LGPL-3.0
 */

const WebSocket = require('ws');
const Client = require('./Client.js');

const defaultMaxDelay = 30000;
const defaultMinDelay = 1000;

class ReconnectingClient extends Client {
    constructor (opts) {
        super(opts);

        this._maxDelay = opts.reconnect.maxDelay || defaultMaxDelay;
        this._minDelay = opts.reconnect.minDelay || defaultMinDelay;
        this._delay = 0;

        this._socket.on('close', () => {
            this._reconnect();
        });

        this._socket.on('open', () => {
            this._delay = 0;
        });
    }

    _reconnect () {
        if (this._closed || this._socket.readyState <= WebSocket.OPEN) {
            return;
        }

        this._delay = Math.min(this._delay + this._minDelay, this._maxDelay);

        this.emit('reconnect');
        this._connect();

        setTimeout(() => {
            this._reconnect();
        }, this._delay);
    }
}

module.exports = ReconnectingClient;
