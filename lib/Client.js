'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2019
 * @license LGPL-3.0
 */

const { EventEmitter } = require('events');
const WebSocket = require('ws');
const watchdog = require('./watchdog.js');

class Client extends EventEmitter {
    constructor (opts) {
        super();

        this._closed = false;
        this._opts = opts;
        this._q = [];

        this._connect();
    }

    _connect () {
        this._socket = new WebSocket(this._opts.url, this._opts.protocols || '', this._opts.ws);

        this._socket.on('close', (code, reason) => this.emit('close', code, reason));
        this._socket.on('error', (error) => this.emit('error', error));
        this._socket.on('message', (data) => this.emit('message', data));
        this._socket.on('open', () => this.emit('open'));
        this._socket.on('upgrade', (req) => this.emit('upgrade', req));

        this._socket.once('open', () => {
            watchdog(this._socket, this._opts.pingInterval);
            this._send_q();
        });
    }

    _send_q () {
        while (this._q.length && this._socket.readyState === WebSocket.OPEN) {
            const msg = this._q.shift();
            this._socket.send(msg[0], msg[1], msg[2]);
        }
    }

    /**
     * Close socket
     * @param  {Number} [code]
     * @param  {String} [reason]
     */
    close (code, reason) {
        this._closed = true;
        this._socket.close(code, reason);
    }

    /**
     * Send message
     * @param  {Any}      data
     * @param  {Object}   [opts]
     * @param  {Function} [callback]
     */
    send (data, opts, callback) {
        this._q.push([data, opts, callback]);
        this._send_q();

        if (this._opts.maxQueueLength && this._q.length > this._opts.maxQueueLength) {
            this.emit('error', new Error('Queue length exceeded'));
        }
    }

    /**
     * Forcibly terminate the connection
     * @param  {Number} [code]
     * @param  {String} [reason]
     */
    terminate () {
        this._closed = true;
        this._socket.terminate();
    }
}

module.exports = Client;
